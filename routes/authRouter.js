const express = require('express');
const router = express.Router();
router.use(express.json());
const userController = require('../controllers/userController');

router.get('/', userController.userRegister);

