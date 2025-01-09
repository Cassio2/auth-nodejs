const express = require('express');
const router = express.Router();
router.use(express.json());
const userController = require('../controllers/userController');

router.get('/mail-verification', userController.mailVerification);



module.exports = router;