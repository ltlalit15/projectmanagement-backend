const db = require('../config');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');
const cloudinary = require('cloudinary').v2;
const logActivity = require('../utils/logActivity')

// Cloudinary Configuration
cloudinary.config({
    cloud_name: 'dkqcqrrbp',
    api_key: '418838712271323',
    api_secret: 'p12EKWICdyHWx8LcihuWYqIruWQ'
});



const createEmailTask = async (req, res) => {
  try {
    const { title, description, priority, deadline, assignedTo, taskType, invoiceAmount } = req.body;

    let imageUrls = [];

    // ✅ Handle image upload using tempFilePath
    if (req.files?.image) {
      const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

      for (const file of files) {
        const uploaded = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "management" // 👈 change folder name as needed
        });
        imageUrls.push(uploaded.secure_url);
      }
    } else {
      return res.status(400).json({ status: false, message: "At least one image is required" });
    }

    const imageStr = imageUrls.join(','); // Store comma-separated in DB

    const [result] = await db.query(
      `INSERT INTO emailtask (title, description, priority, deadline, assignedTo, taskType, invoiceAmount, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, priority, deadline, assignedTo, taskType, invoiceAmount, imageStr]
    );

    const [created] = await db.query(`SELECT * FROM emailtask WHERE id = ?`, [result.insertId]);
    const task = created[0];

    // ✅ Return image as array in response
    task.image = task.image ? task.image.split(',') : [];

    res.status(201).json({ status: true, message: "task created successfully", data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
  }
};




const getAllEmailTasks = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT e.*, u.name AS assignedUserName
      FROM emailtask e
      LEFT JOIN user u ON e.assignedTo = u.id
    `);

    const tasks = rows.map(task => ({
      ...task,
      image: task.image ? task.image.split(',') : [],
    }));

    res.json({ status: 'success', message: "Reterived data", data: tasks });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};


const getEmailTaskById = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM emailtask WHERE id = ?`, [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Task not found' });
    }

    const task = rows[0];
    task.image = task.image ? task.image.split(',') : [];

    res.json({ status: 'success', message: "Reterived Single data", data: task });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};



const updateEmailTask = async (req, res) => {
  try {
    const { title, description, priority, deadline, assignedTo, taskType, invoiceAmount } = req.body;
    const { id } = req.params;

    let imageUrls = [];

    // ✅ If new image(s) uploaded
    if (req.files?.image) {
      const files = Array.isArray(req.files.image) ? req.files.image : [req.files.image];

      for (const file of files) {
        const uploaded = await cloudinary.uploader.upload(file.tempFilePath, {
          folder: "management" // keep same folder
        });
        imageUrls.push(uploaded.secure_url);
      }
    }

    // ✅ If no new image uploaded, retain old image
    let imageStr = '';
    if (imageUrls.length > 0) {
      imageStr = imageUrls.join(',');
    } else {
      const [existing] = await db.query(`SELECT image FROM emailtask WHERE id = ?`, [id]);
      if (existing.length === 0) {
        return res.status(404).json({ status: false, message: "Task not found" });
      }
      imageStr = existing[0].image || '';
    }

    await db.query(
      `UPDATE emailtask 
       SET title = ?, description = ?, priority = ?, deadline = ?, assignedTo = ?, taskType = ?, invoiceAmount = ?,  image = ?
       WHERE id = ?`,
      [title, description, priority, deadline, assignedTo, taskType, invoiceAmount, imageStr, id]
    );

    const [updated] = await db.query(`SELECT * FROM emailtask WHERE id = ?`, [id]);
    const task = updated[0];
    task.image = task.image ? task.image.split(',') : [];

    res.json({ status: true, message: "task updated successfully", data: task });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
  }
};


const deleteEmailTask = async (req, res) => {
  try {
    const [check] = await db.query(`SELECT * FROM emailtask WHERE id = ?`, [req.params.id]);
    if (check.length === 0) {
      return res.status(404).json({ status: 'error', message: 'Task not found' });
    }

    await db.query(`DELETE FROM emailtask WHERE id = ?`, [req.params.id]);

    res.json({ status: 'success', message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};


module.exports = {createEmailTask, getAllEmailTasks, getEmailTaskById, updateEmailTask, deleteEmailTask}
