const express = require('express');
const { getDashboardData } = require('../controller/dashboard');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');


const router = express.Router();


router.get('/getDashboardData', getDashboardData);


module.exports = router;    
