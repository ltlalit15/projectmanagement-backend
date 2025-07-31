const express = require('express');
const { addEmailReport, getAllEmailReports, getEmailReportById, updateEmailReport, deleteEmailReport } = require('../controller/email');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

router.post('/addEmailReport', authMiddleware, addEmailReport);
router.get('/getAllEmailReports',  getAllEmailReports);
router.get('/getEmailReportById/:id', getEmailReportById);
router.patch('/updateEmailReport/:id', authMiddleware, updateEmailReport);
router.delete('/deleteEmailReport/:id', authMiddleware, deleteEmailReport); 


module.exports = router;


addEmailReport, getAllEmailReports, getEmailReportById, updateEmailReport, deleteEmailReport






