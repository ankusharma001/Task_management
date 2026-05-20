const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  getAllUsers
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateRegister, validateLogin } = require('../validators/authValidator');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.get('/profile', protect, getProfile);
router.get('/users', protect, getAllUsers);

module.exports = router;
