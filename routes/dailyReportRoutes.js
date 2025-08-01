const express = require('express');
const { createDailyReport, getAllDailyReports, getDailyReportById, updateDailyReport, deleteDailyReport } = require('../controller/dailyReport');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const router = express.Router();

router.post('/createDailyReport', authMiddleware, createDailyReport);
router.get('/getAllDailyReports',  getAllDailyReports);
router.get('/getDailyReportById/:id', getDailyReportById);
router.patch('/updateDailyReport/:id', authMiddleware, updateDailyReport);
router.delete('/deleteDailyReport/:id', authMiddleware, deleteDailyReport); 


module.exports = router;






