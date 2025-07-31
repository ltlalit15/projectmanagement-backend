const db = require('../config');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');



const addEmployeeTask = async (req, res) => {
  try {
    const { title, assignedTo, startDateTime, endDateTime, status, description } = req.body;

    const [existing] = await db.query(
      "SELECT * FROM employeetask WHERE title = ? AND assignedTo = ? AND startDateTime = ?",
      [title, assignedTo, startDateTime]
    );

    if (existing.length > 0) {
      return res.status(409).json({ status: "error", message: "Task already exists" });
    }

    const [result] = await db.query(
      "INSERT INTO employeetask (title, assignedTo, startDateTime, endDateTime, status, description) VALUES (?, ?, ?, ?, ?, ?)",
      [title, assignedTo, startDateTime, endDateTime, status, description]
    );

    const [newTask] = await db.query("SELECT * FROM employeetask WHERE id = ?", [result.insertId]);

    res.status(201).json({ status: "success", message: "Task added", data: newTask[0] });
  } catch (err) {
    console.error("Add task error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


const getAllEmployeeTasks = async (req, res) => {
  try {
    const [tasks] = await db.query(`
      SELECT employeetask.*, user.name AS assignedToName 
      FROM employeetask
      LEFT JOIN user ON employeetask.assignedTo = user.id
    `);

    res.status(200).json({ status: "success", message: "Tasks fetched", data: tasks });
  } catch (err) {
    console.error("Fetch tasks error:", err);
    res.status(500).json({ status: "error", message: "Failed to fetch tasks" });
  }
};


const getEmployeeTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    const [task] = await db.query("SELECT * FROM employeetask WHERE id = ?", [id]);
    if (task.length === 0) {
      return res.status(404).json({ status: "error", message: "Task not found" });
    }
    res.status(200).json({ status: "success", message: "Task found", data: task[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


const updateEmployeeTask = async (req, res) => {
  const { id } = req.params;
  const { title, assignedTo, startDateTime, endDateTime, status, description } = req.body;

  try {
    const [existing] = await db.query("SELECT * FROM employeetask WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: "error", message: "Task not found" });
    }

    await db.query(
      "UPDATE employeetask SET title = ?, assignedTo = ?, startDateTime = ?, endDateTime = ?, status = ?, description = ? WHERE id = ?",
      [title, assignedTo, startDateTime, endDateTime, status, description, id]
    );

    const [updatedTask] = await db.query("SELECT * FROM employeetask WHERE id = ?", [id]);

    res.status(200).json({ status: "success", message: "Task updated", data: updatedTask[0] });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


const deleteEmployeeTask = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await db.query("SELECT * FROM employeetask WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ status: "error", message: "Task not found" });
    }

    await db.query("DELETE FROM employeetask WHERE id = ?", [id]);

    res.status(200).json({ status: "success", message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Server error" });
  }
};



module.exports = {addEmployeeTask, getAllEmployeeTasks, getEmployeeTaskById, updateEmployeeTask, deleteEmployeeTask}