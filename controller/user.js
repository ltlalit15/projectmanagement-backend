const db = require('../config');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();
const path = require('path');
const nodemailer = require('nodemailer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './upload');  // Specify the folder where images will be stored
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);  // Get file extension
        const fileName = Date.now() + fileExtension;  // Use a unique name
        cb(null, fileName);
    }
});

const upload = multer({ storage: storage });

const addUser = async (req, res) => {
  try {
    const { name, email, role, password, permissions, assignedTasks } = req.body;

    const [existing] = await db.query("SELECT * FROM user WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(409).json({ status: "error", message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);   

    // INSERT user
    const [insertResult] = await db.query(
      "INSERT INTO user (name, email, role, password, permissions, assignedTasks) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, role, hashedPassword, JSON.stringify(permissions), JSON.stringify(assignedTasks)]
    );

    // 🔍 SELECT inserted user by insertId
    const [newUserRows] = await db.query("SELECT * FROM user WHERE id = ?", [insertResult.insertId]);

    const user = newUserRows[0];
    delete user.password;
    user.permissions = JSON.parse(user.permissions || '{}');
    user.assignedTasks = JSON.parse(user.assignedTasks || '[]');

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      data: user
    });
  } catch (err) {
    console.error("Add user error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query("SELECT * FROM user");

    const parsedUsers = users.map(user => ({
      ...user,
      permissions: JSON.parse(user.permissions || '{}'),
      assignedTasks: JSON.parse(user.assignedTasks || '[]')
    }));

    res.status(200).json({
      status: "success",
      message: "Users fetched successfully",
      data: parsedUsers
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ status: "error", message: "Failed to fetch users" });
  }
};



const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("SELECT * FROM user WHERE id = ?", [id]);

    if (result.length === 0) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    const user = result[0];
    user.permissions = JSON.parse(user.permissions || '{}');
    user.assignedTasks = JSON.parse(user.assignedTasks || '[]');

    res.status(200).json({ status: "success", message: "User fetched", data: user });
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, password, permissions, assignedTasks } = req.body;

    const [user] = await db.query("SELECT * FROM user WHERE id = ?", [id]);
    if (user.length === 0) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    let hashedPasswordClause = '';
    let queryParams = [name, email, role];

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      hashedPasswordClause = ', password = ?';
      queryParams.push(hashedPassword);
    }

    queryParams.push(JSON.stringify(permissions), JSON.stringify(assignedTasks), id);

    const query = `
      UPDATE user
      SET name = ?, email = ?, role = ?${hashedPasswordClause}, permissions = ?, assignedTasks = ?
      WHERE id = ?
    `;

    await db.query(query, queryParams);

    const [updated] = await db.query("SELECT * FROM user WHERE id = ?", [id]);

    const updatedUser = updated[0];
    delete updatedUser.password;
    updatedUser.permissions = JSON.parse(updatedUser.permissions || '{}');
    updatedUser.assignedTasks = JSON.parse(updatedUser.assignedTasks || '[]');

    res.status(200).json({
      status: "success",
      message: "User updated",
      data: updatedUser
    });

  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ status: "error", message: "Failed to update user" });
  }
};


const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const [user] = await db.query("SELECT * FROM user WHERE id = ?", [id]);
    if (user.length === 0) {
      return res.status(404).json({ status: "error", message: "User not found" });
    }

    await db.query("DELETE FROM user WHERE id = ?", [id]);

    res.status(200).json({ status: "success", message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ status: "error", message: "Failed to delete user" });
  }
};



// Login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const [user] = await db.query('SELECT id, email, role, password FROM user WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(400).json({ status: "false", message: 'Invalid email or password', data: [] });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ status: "false", message: 'Invalid email or password', data: [] });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user[0].id, email: user[0].email, role: user[0].role },
            process.env.JWT_SECRET,
            { expiresIn: '4h' }
        );

        // Prepare response data (including password)
        const userData = {
            id: user[0].id.toString(),
            email: user[0].email,
            password: user[0].password,
            role: user[0].role, 
            token: token
        };

        res.json({ status: "true", message: 'Login successful', data: userData });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Protected Route
const protectedRoute = (req, res) => {
    res.json({ message: 'You have accessed a protected route!', user: req.user });
    
};


// Export the functions
module.exports = { login, addUser, getAllUsers, getUserById, updateUser, deleteUser,  protectedRoute };
