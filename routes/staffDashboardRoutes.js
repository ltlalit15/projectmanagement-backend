const express = require('express');
const { getStaffDashboardData } = require('../controller/staffDashboard');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');


const router = express.Router();


router.get('/getStaffDashboardData/:userId', getStaffDashboardData);


module.exports = router;    
