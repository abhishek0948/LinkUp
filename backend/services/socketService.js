const {Server} = require("socket.io");
const User = require("../models/User.Model");
const Message = require("../models/Message.Model");

const onlineUsers = new Map();
const typingUsers = new Map();

const initializeSocket = (server) => {
    const io = new Server(server,{
        cors: {
            origin: process.env.FRONTEND_URL,
            credentials: true,
            methods: ['GET','POST','PUT','DELETE','OPTIONS']
        },
        pingTimeout: 600000
    })

    io.on("connection",(socket) => {
        console.log(`User connected with ${socket.id}`);
        let userId = null;

        socket.on("user_connected",async(connectingUserId) => {
            try {
                userId = connectingUserId;
                onlineUsers.set(userId,socket.id);
                socket.join(userId);

                await User.findByIdAndUpdate(userId , {
                    isOnline: true,
                    lastSeen: new Date()
                })

                io.emit("user_status",{userId,isOnline:true});
            } catch (error) {
                console.error("Error handling user connection",error);
            }
        });

        socket.on("get_user_status",(requestedUserId,callback) => {
            const isOnline = onlineUsers.has(requestedUserId);
            callback({
                userId: requestedUserId,
                isOnline,
                lastSeen: isOnline ? new Date() : null
            })
        })

        socket.on("send_message", async(message) => {
            try {
                const receiverSocketId = onlineUsers.get(message.receiver?._id);
                if(receiverSocketId) {
                    io.to(receiverSocketId).emit("receive_message",message)
                }
            } catch (error) {
                console.log("error sending message");
                socket.emit("message_error",{error:"Failed to send message"});
            }
        })

        socket.on("message_read",async({messageIds,senderId}) => {
            try {
                await Message.updateMany(
                    {_id: {$in: messageIds}},
                    {$set: {messageStatus: "read"}}
                )

                const senderSocketId = onlineUsers.get(senderId);
                if(senderSocketId) {
                    messageIds.forEach((messageId) => {
                        io.to(senderSocketId).emit("message_status_update",{
                            messageId,
                            messageStatus: "read"
                        })
                    });
                }
            } catch (error) {
                console.error("error reading message from socket",error.message);
                socket.emit("message_error",{error:"Failed to read message"});
            }
        })

        socket.on("typing_start",({conversationId,receiverId}) => {
            if(!userId || !conversationId || !receiverId) {
                return ;
            }

            if(!typingUsers.has(userId)) typingUsers.set(userId, {});

            const userTyping = typingUsers.get(userId);

            userTyping[conversationId] = true;

            // clear existing timeout
            if(userTyping[`${conversationId}_timeout`]) {
                clearTimeout(userTyping[`${conversationId}_timeout`])
            }

            // auto-type after 3s
            userTyping[`${conversationId}_timeout`] = setTimeout(() => {
                userTyping[conversationId] = false;
                socket.to(receiverId).emit("user_typing",{
                    userId,
                    conversationId,
                    isTyping: false
                })
            },3000)

            // notify receiver
            socket.to(receiverId).emit("user_typing",{
                userId,
                conversationId,
                isTyping: true
            })
        })

        socket.on("typing_stop",({conversationId,receiverId}) => {
            if(!userId || !conversationId || !receiverId) {
                return ;
            }

            if(typingUsers.has(userId)) {
                const userTyping = typingUsers.get(userId);
                userTyping[conversationId] = false;

                if(userTyping[`${conversationId}_timeout`]) {
                    clearTimeout(userTyping[`${conversationId}_timeout`]);
                    delete userTyping[`${conversationId}_timeout`];
                }
            }

            socket.to(receiverId).emit("user_typing",{
                userId,
                conversationId,
                isTyping: false
            })
        })

        socket.on("add_reaction",async({messageId,emoji,userId:reactionUserId}) => {
            try {
                const message = await Message.findById(messageId);
                if(!message) return;

                const existingIdx = message.reactions.findIndex(
                    (r) => r.user.toString() === reactionUserId
                )

                if(existingIdx > -1) {
                    const existing = message.reactions[existingIdx];
                    if(existing.emoji === emoji) {
                        message.reactions.splice(existingIdx,1); // Remove same emoji
                    } else {
                        message.reactions[existingIdx].emoji = emoji; // Add new emoji
                    }
                } else {
                    message.reactions.push({user:reactionUserId,emoji})
                }

                await message.save();
                const populatedMessage = await Message.findOne({ _id: message?._id })
                .populate("sender","username profilePicture")
                .populate("receiver","username profilePicture")
                .populate("reactions.user","username");

                const reactionUpdated = {
                    messageId,
                    reactions: populatedMessage.reactions
                } 

                const senderSocketId = onlineUsers.get(populatedMessage.sender._id.toString());
                const receiverSocketId = onlineUsers.get(populatedMessage.receiver._id.toString());

                if(senderSocketId) {
                    io.to(senderSocketId).emit("reaction_update",reactionUpdated);
                }
                if(receiverSocketId) {
                    io.to(receiverSocketId).emit("reaction_update",reactionUpdated);
                }
            } catch (error) {
                console.log("error handling reaction",error.message);
                socket.emit("message_error",{error:"Failed to update emoji"});
            }
        });

        const handleDisconnected = async() => {
            if(!userId) {
                return ;
            }

            try {
                onlineUsers.delete(userId);

                if(typingUsers.has(userId)) {
                    const userTyping = typingUsers.get(userId);
                    Object.keys(userTyping).forEach((key) => {
                        if(key.endsWith('_timeout')) clearTimeout(userTyping[key]);
                    })
                    typingUsers.delete(userId);
                }

                await User.findByIdAndUpdate(userId,{
                    isOnline: false,
                    lastSeen: new Date()
                })

                io.emit("user_status",{
                    userId,
                    isOnline: false,
                    lastSeen: new Date()
                })

                socket.leave(userId);
            } catch (error) {
                console.error("error disconnecting to socket");
            }
        }

        socket.on("disconnect",handleDisconnected);
    })

    io.socketUserMap = onlineUsers;

    return io;
}

module.exports = initializeSocket;