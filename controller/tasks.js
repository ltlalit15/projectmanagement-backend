const db = require('../config');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');


const addTask = async (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, taskType, invoiceAmount, dueDate } = req.body;
 
    // Check if task already exists
    const [existing] = await db.query(
      "SELECT * FROM tasks WHERE title = ? AND assignedTo = ? AND dueDate = ?",
      [title, assignedTo, dueDate]
    );

    if (existing.length > 0) {
      return res.status(409).json({ message: "Task already exists for this user on that date" });
    }

    // Insert the new task
    const [insertResult] = await db.query(
      "INSERT INTO tasks (title, description, status, priority, assignedTo, taskType, invoiceAmount, dueDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [title, description, status, priority, assignedTo, taskType, invoiceAmount, dueDate]
    );

    const insertedId = insertResult.insertId;

    // Fetch and return the inserted task
    const [newTask] = await db.query("SELECT * FROM tasks WHERE id = ?", [insertedId]);

    res.status(201).json({ status: true, message: "Task added successfully", task: newTask[0] });
  } catch (err) {
    console.error("Add task error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};


const getAllTasks = async (req, res) => {
  try {
    const [tasks] = await db.query(`
      SELECT 
        tasks.*, 
        user.name AS assignedToName
      FROM tasks
      LEFT JOIN user ON tasks.assignedTo = user.id
   
    `);

    res.status(200).json({
      status: "success",
      message: "Tasks fetched successfully",
      data: tasks,
    });
  } catch (err) {
    console.error("Get all tasks error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch tasks",
    });
  }
};



const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const [task] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);

    if (task.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Task fetched successfully",
      data: task[0],
    });
  } catch (err) {
    console.error("Get task by ID error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch task",
    });
  }
};



const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assignedTo, taskType, invoiceAmount, dueDate } = req.body;

    const [existing] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      });
    }

    await db.query(
      "UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, assignedTo = ?, taskType = ?, invoiceAmount = ?,  dueDate = ? WHERE id = ?",
      [title, description, status, priority, assignedTo, taskType, invoiceAmount, dueDate, id]
    );

    const [updatedTask] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);

    res.status(200).json({
      status: "success",
      message: "Task updated successfully",
      data: updatedTask[0],
    });
  } catch (err) {
    console.error("Update task error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to update task",
    });
  }
};


const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);

    if (existing.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Task not found",
      });
    }

    await db.query("DELETE FROM tasks WHERE id = ?", [id]);

    res.status(200).json({
      status: "success",
      message: "Task deleted successfully",
    });
  } catch (err) {
    console.error("Delete task error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to delete task",
    });
  }
};


const getTaskStatus = async (req, res) => {
  try {
    // Total tasks
    const [[{ totalTasks }]] = await db.query("SELECT COUNT(*) as totalTasks FROM tasks");

    // Case-insensitive counts for each status
    const [[{ completed }]] = await db.query(
      "SELECT COUNT(*) as completed FROM tasks WHERE LOWER(status) = LOWER('completed')"
    );

    const [[{ inProgress }]] = await db.query(
      "SELECT COUNT(*) as inProgress FROM tasks WHERE LOWER(status) = LOWER('in progress')"
    );

    const [[{ pending }]] = await db.query(
      "SELECT COUNT(*) as pending FROM tasks WHERE LOWER(status) = LOWER('pending')"
    );

    res.status(200).json({
      status: "success",
      message: "Task stats fetched successfully",
      data: {
        totalTasks,
        completed,
        inProgress,
        pending,
      },
    });
  } catch (err) {
    console.error("Get task stats error:", err);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch task stats",
    });
  }
};




module.exports = { addTask, getAllTasks, getTaskById, updateTask, deleteTask, getTaskStatus };
