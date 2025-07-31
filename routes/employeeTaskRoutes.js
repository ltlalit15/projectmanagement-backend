const express = require('express');
const { addEmployeeTask, getAllEmployeeTasks, getEmployeeTaskById, updateEmployeeTask, deleteEmployeeTask } = require('../controller/employeeTask');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');


const router = express.Router();

router.post('/addEmployeeTask', authMiddleware, addEmployeeTask);
router.get('/getAllEmployeeTasks', getAllEmployeeTasks);
router.get('/getEmployeeTaskById/:id', getEmployeeTaskById);
router.patch('/updateEmployeeTask/:id', authMiddleware, updateEmployeeTask);
router.delete('/deleteEmployeeTask/:id', authMiddleware, deleteEmployeeTask);




module.exports = router;






