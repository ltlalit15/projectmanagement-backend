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

const addEmailReport = async (req, res) => {
  try {
    const { recipient, subject, message } = req.body;

    // Insert into DB
    const [result] = await db.query(
      "INSERT INTO emailreports (recipient, subject, message) VALUES (?, ?, ?)",
      [recipient, subject, message]
    );

    // Get the newly inserted ID
    const insertedId = result.insertId;

    // Fetch and return the inserted report
    const [newReport] = await db.query("SELECT * FROM emailreports WHERE id = ?", [insertedId]);

    res.status(201).json({
      status: "success",
      message: "Email report saved successfully",
      data: newReport[0],
    });
  } catch (err) {
    console.error("Add email report error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};



const getAllEmailReports = async (req, res) => {
  try {
    const [data] = await db.query("SELECT * FROM emailreports");
    res.status(200).json({ status: "success", message: "Reports fetched", data });
  } catch (err) {
    console.error("Fetch reports error:", err);
    res.status(500).json({ status: "error", message: "Failed to fetch reports" });
  }
};


const getEmailReportById = async (req, res) => {
  try {
    const { id } = req.params;
    const [data] = await db.query("SELECT * FROM emailreports WHERE id = ?", [id]);

    if (data.length === 0) {
      return res.status(404).json({ status: "error", message: "Report not found" });
    }

    res.status(200).json({ status: "success", message: "Report found", data: data[0] });
  } catch (err) {
    console.error("Fetch report error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


const updateEmailReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { recipient, subject, message } = req.body;

    const [check] = await db.query("SELECT * FROM emailreports WHERE id = ?", [id]);
    if (check.length === 0) {
      return res.status(404).json({ status: "error", message: "Report not found" });
    }

    await db.query(
      "UPDATE emailreports SET recipient = ?, subject = ?, message = ? WHERE id = ?",
      [recipient, subject, message, id]
    );

    const [data] = await db.query("SELECT * FROM emailreports WHERE id = ?", [id]);

    res.status(200).json({ status: "success", message: "Report updated", data: data[0] });
  } catch (err) {
    console.error("Update report error:", err);
    res.status(500).json({ status: "error", message: "Failed to update report" });
  }
};



const deleteEmailReport = async (req, res) => {
  try {
    const { id } = req.params;

    const [check] = await db.query("SELECT * FROM emailreports WHERE id = ?", [id]);
    if (check.length === 0) {
      return res.status(404).json({ status: "error", message: "Report not found" });
    }

    await db.query("DELETE FROM emailreports WHERE id = ?", [id]);

    res.status(200).json({ status: "success", message: "Report deleted successfully" });
  } catch (err) {
    console.error("Delete report error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};




module.exports = { addEmailReport, getAllEmailReports, getEmailReportById, updateEmailReport, deleteEmailReport };
