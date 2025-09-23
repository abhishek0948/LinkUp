const handleVideoCallEvent = (socket, io, onlineUsers) => {
  // Initiate call
  socket.on(
    "initiate_call",
    ({ callerId, receiverId, callType, callerInfo }) => {
      const receiverSocketId = onlineUsers.get(receiverId);

      if (receiverSocketId) {
        const callId = `${callerId}-${receiverId}-${Date.now()}`;

        // console.log("Call initaited .......")
        io.to(receiverSocketId).emit("incoming_call", {
          callerId,
          callerName: callerInfo.username,
          callerAvatar: callerInfo.profilePicture,
          callId,
          callType,
        });
      } else {
        console.log(`server:Receiver ${receiverId} is offline`);
        socket.emit("call_failed", { reason: "user is offline" });
      }
    }
  );

  // Accecpt call
  socket.on("accept_call", ({ callerId, callId, receiverInfo }) => {
    const callerSocketId = onlineUsers.get(callerId);

    if (callerSocketId) {
      io.to(callerSocketId).emit("call_accepted", {
        callerName: receiverInfo.username,
        callerAvatar: receiverInfo.profilePicture,
        callId
      });
    } else {
      console.log(`server:Caller ${callerId} not found`);
    }
  });

  // Reject call
  socket.on("reject_call", ({ callerId, callId }) => {
    const callerSocketId = onlineUsers.get(callerId);

    if (callerSocketId) {
      io.to(callerSocketId).emit("call_rejected", {
        callId,
      });
    }
  });

  // End call
  socket.on("end_call", ({ callId, participantId }) => {
    const participantSocketId = onlineUsers.get(participantId);

    if (participantSocketId) {
      io.to(participantSocketId).emit("call_ended", {
        callId,
      });
    }
  });

  // Web RTC signaling events with proper userId

  // Creating offer
  socket.on("webrtc_offer", ({offer,receiverId,callId}) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    if(receiverSocketId) {
        io.to(receiverSocketId).emit("webrtc_offer",{
            offer,
            senderId:socket.userId,
            callId
        })
        console.log(`server: offer forwarded to ${receiverId}`)
    } else {
        console.log(`server: receiver ${receiverId} not found the offer`)
    }
  });

  // answering offer
  socket.on("webrtc_answer", ({answer,receiverId,callId}) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    if(receiverSocketId) {
        io.to(receiverSocketId).emit("webrtc_answer",{
            answer,
            senderId:socket.userId,
            callId
        })
        console.log(`server ans forwarded to ${receiverId}`)
    } else {
        console.log(`server: receiver ${receiverId} not found the answer`)
    }
  });

  // answering offer
  socket.on("webrtc_ice_candidate", ({candidate,receiverId,callId}) => {
    const receiverSocketId = onlineUsers.get(receiverId);

    if(receiverSocketId) {
        io.to(receiverSocketId).emit("webrtc_ice_candidate",{
            candidate,
            senderId:socket.userId,
            callId
        })
        console.log(`server ice candidate event...`)
    } else {
        console.log(`server: receiver ${receiverId} not found the ICE candidate`)
    }
  });

};

module.exports = handleVideoCallEvent
