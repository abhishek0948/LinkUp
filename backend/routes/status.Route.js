const express = require('express');
const statusController = require('../controllers/status.Controller');
const authMiddleware = require('../middleware/auth.Middleware');
const { multermiddleware } = require('../config/cloudinaryConfig');

const router = express.Router();

router.post('/',authMiddleware,multermiddleware,statusController.createStatus);

router.put('/:statusId/views',authMiddleware,statusController.viewStatus);

router.delete('/:statusId',authMiddleware,statusController.deleteStatus);

router.get('/',authMiddleware,statusController.getStatus);


module.exports = router;