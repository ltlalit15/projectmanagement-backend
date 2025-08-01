const express = require('express');
const { createEmailTask, getAllEmailTasks, getEmailTaskById, updateEmailTask, deleteEmailTask } = require('../controller/emailTask');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');


const router = express.Router();

router.post('/createEmailTask', authMiddleware, createEmailTask);
router.get('/getAllEmailTasks', getAllEmailTasks);
router.get('/getEmailTaskById/:id', getEmailTaskById);
router.patch('/updateEmailTask/:id', authMiddleware, updateEmailTask);
router.delete('/deleteEmailTask/:id', authMiddleware, deleteEmailTask);


module.exports = router;






