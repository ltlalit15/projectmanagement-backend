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




const getStaffDashboardData = async (req, res) => {
  try {
    const userId = req.params.userId; // 👈 Get userId from route params
    const today = new Date().toISOString().split("T")[0];

    // Total tasks for this user
    const [[{ totalTasks }]] = await db.query(
      "SELECT COUNT(*) as totalTasks FROM tasks WHERE assignedTo = ?",
      [userId]
    );

    // Completed Today
    const [[{ completedToday }]] = await db.query(
      `
      SELECT COUNT(*) as completedToday 
      FROM tasks 
      WHERE assignedTo = ? AND DATE(createdAt) = ? AND LOWER(status) = 'completed'
      `,
      [userId, today]
    );

    // Pending Tasks
    const [[{ pendingTasks }]] = await db.query(
      `
      SELECT COUNT(*) as pendingTasks 
      FROM tasks 
      WHERE assignedTo = ? AND LOWER(status) = 'pending'
      `,
      [userId]
    );

    // Overdue Tasks
    const [[{ overdueTasks }]] = await db.query(
      `
      SELECT COUNT(*) as overdueTasks 
      FROM tasks 
      WHERE assignedTo = ? AND dueDate < ? AND LOWER(status) != 'completed'
      `,
      [userId, today]
    );

    // Task completion breakdown for this user
    const [statusBreakdown] = await db.query(
      `
      SELECT LOWER(status) AS status, COUNT(*) AS count
      FROM tasks
      WHERE assignedTo = ?
      GROUP BY LOWER(status)
      `,
      [userId]
    );

    // All tasks for this user with user name
    const [tasks] = await db.query(
      `
      SELECT t.*, u.name AS assignedToName
      FROM tasks t
      LEFT JOIN user u ON t.assignedTo = u.id
      WHERE t.assignedTo = ?
      `,
      [userId]
    );

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



module.exports = { getStaffDashboardData };
