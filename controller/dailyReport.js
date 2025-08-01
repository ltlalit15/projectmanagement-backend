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


// ✅ Create Daily Report
const createDailyReport = async (req, res) => {
  try {
    const { reportDate, durationSpent, taskTitle, whatWasDone, issues } = req.body;

    const [result] = await db.query(
      `INSERT INTO dailyreports (reportDate, durationSpent, taskTitle, whatWasDone, issues)
       VALUES (?, ?, ?, ?, ?)`,
      [reportDate, durationSpent, taskTitle, whatWasDone, issues]
    );

    const [created] = await db.query(`SELECT * FROM dailyreports WHERE id = ?`, [result.insertId]);
    const report = created[0];

    res.status(201).json({ status: true, message: "Daily report submitted successfully", data: report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: false, message: err.message });
  }
};


// ✅ Get All Daily Reports
const getAllDailyReports = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM dailyreports`);
    res.json({ status: true, message: "Reterived data", data: rows });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};

// ✅ Get Daily Report by ID
const getDailyReportById = async (req, res) => {
  try {
    const [rows] = await db.query(`SELECT * FROM dailyreports WHERE id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ status: false, message: "Report not found" });
    res.json({ status: true, message: "Reterived Single data", data: rows[0] });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};



const updateDailyReport = async (req, res) => {
  try {
    const { reportDate, durationSpent, taskTitle, whatWasDone, issues } = req.body;

    // 🔄 Update the record
    await db.query(
      `UPDATE dailyreports 
       SET reportDate = ?, durationSpent = ?, taskTitle = ?, whatWasDone = ?, issues = ?
       WHERE id = ?`,
      [reportDate, durationSpent, taskTitle, whatWasDone, issues, req.params.id]
    );

    // ✅ Fetch the updated row
    const [updated] = await db.query(`SELECT * FROM dailyreports WHERE id = ?`, [req.params.id]);

    // ⛳ Response
    res.status(200).json({
      status: true,
      message: "Daily report updated successfully",
      data: updated[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      status: false,
      message: err.message,
    });
  }
};



// ✅ Delete Daily Report
const deleteDailyReport = async (req, res) => {
  try {
    await db.query(`DELETE FROM dailyreports WHERE id = ?`, [req.params.id]);
    res.json({ status: true, message: "Daily report deleted successfully" });
  } catch (err) {
    res.status(500).json({ status: false, message: err.message });
  }
};


module.exports = {
  createDailyReport,
  getAllDailyReports,
  getDailyReportById,
  updateDailyReport,
  deleteDailyReport
};
