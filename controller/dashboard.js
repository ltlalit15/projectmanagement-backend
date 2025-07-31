const db = require('../config');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');

const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: 'dkqcqrrbp',
    api_key: '418838712271323',
    api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});

const getDashboardData = async (req, res) => {
  try {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0];

    // Total tasks
    const [[{ totalTasks }]] = await db.query("SELECT COUNT(*) as totalTasks FROM tasks");

    // Completed Today (case-insensitive)
    const [[{ completedToday }]] = await db.query(`
      SELECT COUNT(*) as completedToday 
      FROM tasks 
      WHERE DATE(createdAt) = ? AND LOWER(status) = 'completed'
    `, [today]);

    // Pending Tasks (case-insensitive)
    const [[{ pendingTasks }]] = await db.query(`
      SELECT COUNT(*) as pendingTasks 
      FROM tasks 
      WHERE LOWER(status) = 'pending'
    `);

    // Overdue Tasks
    const [[{ overdueTasks }]] = await db.query(`
      SELECT COUNT(*) as overdueTasks 
      FROM tasks 
      WHERE dueDate < ? AND LOWER(status) != 'completed'
    `, [today]);

    // Task completion breakdown
    const [statusBreakdown] = await db.query(`
      SELECT LOWER(status) AS status, COUNT(*) AS count
      FROM tasks
      GROUP BY LOWER(status)
    `);

    // Get all tasks with user names
    const [tasks] = await db.query(`
      SELECT t.*, u.name AS assignedToName
      FROM tasks t
      LEFT JOIN user u ON t.assignedTo = u.id
      
    `);

    res.status(200).json({
      status: "success",
      message: "Dashboard data fetched successfully",
      data: {
        totalTasks,
        completedToday,
        pendingTasks,
        overdueTasks,
        statusBreakdown,
        tasks,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch dashboard data",
    });
  }
};



module.exports = { getDashboardData };
