const express = require('express');
const { addTask, getAllTasks, getTaskById, updateTask, deleteTask, getTaskStatus } = require('../controller/tasks');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');


const router = express.Router();

router.post('/addTask', authMiddleware, addTask);
router.get('/getAllTasks', getAllTasks);
router.get('/getTaskById/:id', getTaskById);
router.patch('/updateTask/:id', authMiddleware, updateTask);
router.delete('/deleteTask/:id', authMiddleware, deleteTask);
router.get('/getTaskStatus', getTaskStatus);



module.exports = router;  






