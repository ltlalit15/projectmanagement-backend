const express = require('express');
const { login, addUser, getAllUsers, getUserById, updateUser, deleteUser, protectedRoute } = require('../controller/user');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');



const router = express.Router();

router.post('/login',  login);
router.post('/addUser', authMiddleware, addUser);
router.patch('/updateUser/:id', authMiddleware, updateUser);
router.get('/getAllUsers', getAllUsers);
router.get('/getUserById/:id', getUserById);
router.delete('/deleteUser/:id', authMiddleware, deleteUser);

router.get('/protected', authMiddleware, protectedRoute);



module.exports = router;    





