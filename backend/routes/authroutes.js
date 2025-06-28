const express = require('express');
const router = express.Router();
const { register, login, logout, verifyCode } = require('../controllers/authController');
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout); 
router.post("/verify", verifyCode);

module.exports = router;




