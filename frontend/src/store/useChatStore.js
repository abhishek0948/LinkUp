import { create } from "zustand";
import { getSocket } from "../services/chat.service";
import axiosInstance from "../services/url.service";

export const useChatStore = create((set, get) => ({
  currentUser: null, // Added
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  onlineUsers: new Map(),
  typingUsers: new Map(),

  setCurrentUser: (user) => set({ currentUser: user }),

  initSocketListners: () => {
    const socket = getSocket();
    if (!socket) return;

    socket.off("receive_message");
    socket.off("user_typing");
    socket.off("user_status");
    socket.off("message_error");
    socket.off("send_message");
    // socket.off("message_send");
    socket.off("message_deleted");

    // For receiving message
    socket.on("receive_message", (message) => {});

    // event for sending message
    socket.on("send_message", (message) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === message._id ? { ...msg } : msg
        ),
      }));
    });

    // event to update message status
    socket.on("message_status_update", ({ messageId, messageStatus }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, messageStatus } : msg
        ),
      }));
    });

    // event to handle reaction update
    socket.on("reaction_update", ({ messageId, reactions }) => {
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions } : msg
        ),
      }));
    });

    // event to handle deletion of msg
    socket.on("message_deleted", ({ deletedMessageId }) => {
      set((state) => ({
        messages: state.messages.filter((msg) => msg._id !== deletedMessageId),
      }));
    });

    // event to handle any message error
    socket.on("message_error", (error) => {
      console.log("Message error", error);
    });

    // For handling typing users 
    socket.on("user_typing", ({ userId, conversationId, isTyping }) => {
      set((state) => {
        const newTypingUsers = new Map(state.typingUsers);
        if (!newTypingUsers.has(conversationId)) {
          newTypingUsers.set(conversationId, new Set());
        }

        const typingset = newTypingUsers.get(conversationId);
        if (isTyping) {
          typingset.add(userId);
        } else {
          typingset.delete(userId);
        }

        return { typingUsers: newTypingUsers };
      });
    });

    //For tracking user online or offline
    socket.on("user_status", ({ userId, isOnline, lastSeen }) => {
      set((state) => {
        const newOnlineUsers = new Map(state.onlineUsers);
        newOnlineUsers.set(userId, { isOnline, lastSeen });
        return { onlineUsers: newOnlineUsers };
      });
    });

    const { conversations } = get();
    if (conversations?.data?.length > 0) {
      conversations.data?.forEach((conv) => {
        const otherUser = conv.participants.find(
          (p) => p._id !== get().currentUser._id
        );

        if (otherUser._id) {
          socket.emit("get_user_status", otherUser._id, (status) => {
            set((state) => {
              const newOnlineUsers = new Map(state.onlineUsers);
              newOnlineUsers.set(state.userId, {
                isOnline: state.isOnline,
                lastSeen: state.lastSeen,
              });
              return { onlineUsers: newOnlineUsers };
            });
          });
        }
      });
    }

  },

  fetchConversation: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get("/chats/conversations");
      // console.log("Fetch conversation data",data);
      set({ conversations: data });
      get().initSocketListners();
      return data;
    } catch (error) {
      set({ error: error?.response?.data?.message || error?.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  fetchMessage: async (conversationId) => {
    if (!conversationId) return;
    set({ loading: true, error: null });

    try {
      const { data } = await axiosInstance.get(
        `/chats/conversations/${conversationId}/messages`
      );
      const messageArray = data.data || data || [];
      set({ messages: messageArray, currentConversation: conversationId });

      // Mark unread Message as read
      const { markMessagesAsRead } = get();
      markMessagesAsRead();

      return messageArray;
    } catch (error) {
      set({ error: error?.response?.data?.message || error?.message });
      return [];
    } finally {
      set({ loading: false });
    }
  },

  // send message in real time
  sendMessage: async (formData) => {
    const senderId = formData.get("senderId");
    const receiverId = formData.get("receiverId");
    const media = formData.get("media");
    const content = formData.get("content");
    const messageStatus = formData.get("messageStatus");

    const socket = getSocket();

    const { conversations } = get();
    let conversationId = null;
    if (conversations?.data?.length > 0) {
      const conversation =
        conversations.data.find((conv) =>
          conv.participants.some((p) => p._id === senderId)
          && conv.participants.some((p) => p._id === receiverId)
        );

      if (conversation) {
        conversationId = conversation._id;
        set({ currentConversation: conversationId });
      }
    }

    // Msg before actual response
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      sender: { _id: senderId },
      receiver: { _id: receiverId },
      conversation: conversationId,
      imageOrVideoUrl:
        media && typeof media !== "string" ? URL.createObjectURL(media) : null,
      content: content,
      contentType: media
        ? media.type.startsWith("image")
          ? "image"
          : "video"
        : "text",
      createdAt: new Date().toISOString(),
      messageStatus,
    };

    set((state) => ({
      messages: [...state.messages, optimisticMessage],
    }));

    try {
      const { data } = await axiosInstance.post(
        "/chats/send-message",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const messageData = data.data || data;
      // Replace optimistic msg with real one
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? messageData : msg
        ),
      }));

      return messageData;
    } catch (error) {
      console.error("Error sending message",error);
      set((state) => ({
        messages: state.messages.map((msg) =>
          msg._id === tempId ? {...msg,messageStatus: "failed"} : msg
        ),
        error: error?.message
      }));
      throw error
    }
  },

  receiveMessage: (message) => {
    if (!message) return;

    const { currentConversation, currentUser, messages } = get();

    const messageExists = messages.some((msg) => msg._id === message._id);
    if (messageExists) return;

    if (message.conversation === currentConversation) {
      set((state) => ({
        messages: [...state.messages, message],
      }));

      if (message.receiver?._id === currentUser?._id) {
        get().markMessagesAsRead();
      }
    }

    set((state) => {
      const updateConversations = state.conversations?.data?.map((conv) => {
        if (conv._id === message.conversation) {
          return {
            ...conv,
            lastMessage: message,
            unreadCount:
              message?.receiver?._id === currentUser?._id
                ? (conv.unreadCount || 0) + 1
                : conv.unreadCount || 0,
          };
        }
        return conv;
      });

      return {
        conversations: {
          ...state.conversations,
          data: updateConversations,
        },
      };
    });
  },

  markMessagesAsRead: async () => {
    const { messages, currentUser } = get();

    if (!messages.length || !currentUser) return;

    const unreadIds = messages
      .filter(
        (msg) =>
          msg.messageStatus !== "read" && msg.receiver?._id === currentUser?._id
      )
      .map((msg) => msg._id)
      .filter(Boolean);

    if (unreadIds.length === 0) return;

    try {
      const { data } = await axiosInstance.put("/chats/messages/read", {
        messageIds: unreadIds,
      });

      set((state) => ({
        messages: state.messages.map((msg) =>
          unreadIds.includes(msg._id) ? { ...msg, messageStatus: "read" } : msg
        ),
      }));

      const socket = getSocket();
      if (socket) {
        socket.emit("message_read", {
          messageIds: unreadIds,
          senderId: messages[0]?.sender?._id,
        });
      }
    } catch (error) {
      console.log("Error marking as read messages");
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/chats/messages/${messageId}`);
      set((state) => ({
        messages: state.messages?.filter((msg) => msg?._id !== messageId),
      }));
      return true;
    } catch (error) {
      console.log("Error deleting message");
      set({ error: error?.response?.data?.message || error?.message });
      return false;
    }
  },

  addReaction: async (messageId, emoji) => {
    const socket = getSocket();
    const { currentUser } = get();
    if (socket && currentUser) {
      socket.emit("add_reaction", {
        messageId,
        emoji,
        userId: currentUser._id,
      });
    }
  },

  startTyping: async (receiverId) => {
    const { currentConversation } = get();
    const socket = getSocket();
    if (socket && currentConversation && receiverId) {
      socket.emit("typing_start", {
        conversationId: currentConversation,
        receiverId,
      });
    }
  },

  stopTyping: async (receiverId) => {
    const { currentConversation } = get();
    const socket = getSocket();
    if (socket && currentConversation && receiverId) {
      socket.emit("typing_stop", {
        conversationId: currentConversation,
        receiverId,
      });
    }
  },

  isUserTyping: (userId) => {
    const { typingUsers, currentConversation } = get();
   
    if (
      !currentConversation ||
      !typingUsers.has(currentConversation) ||
      !userId
    ) {
      return false;
    }

    const temp = typingUsers.get(currentConversation).has(userId);
    console.log("Temp",temp);
    return typingUsers.get(currentConversation).has(userId);
  },

  isUserOnline: (userId) => {
    if (!userId) return null;
    const { onlineUsers } = get();
    return onlineUsers.get(userId)?.isOnline || false;
  },

  getUserLastSeen: (userId) => {
    if (!userId) return null;
    const { onlineUsers } = get();
    return onlineUsers.get(userId)?.lastSeen || null;
  },

  cleanUp: () => {
    set({
      conversations: [],
      currentConversation: null,
      messages: [],
      onlineUsers: new Map(),
      typingUsers: new Map(),
    });
  },
}));
