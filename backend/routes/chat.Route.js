const express = require('express');
const chatController = require('../controllers/chat.Controller');
const authMiddleware = require('../middleware/auth.Middleware');
const { multermiddleware } = require('../config/cloudinaryConfig');

const router = express.Router();

router.post('/send-message',authMiddleware,multermiddleware,chatController.sendMessage);

router.get('/conversations',authMiddleware,chatController.getConversation);
router.get('/conversations/:conversationId/messages',authMiddleware,chatController.getMessages);

router.put('/messages/read',authMiddleware,chatController.markAsRead);

router.delete('/messages/:messageId',authMiddleware,chatController.deleteMessage);

module.exports = router;