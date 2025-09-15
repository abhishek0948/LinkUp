const {Server} = require("socket.io");
const User = require("../models/User.Model");
const Message = require("../models/Message.Model");

const onlineUsers = new Map();
const typingUsers = new Map();

