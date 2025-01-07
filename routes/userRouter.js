const express = require('express');
const router = express.Router(); 
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');

// Middleware para analisar JSON
router.use(express.json());

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/image'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Rota para registro de usuários
router.post('/register', upload.single('image'), userController.userRegister);

// Rota de login para teste
router.get('/login', (req, res) => {
    res.send('Login');
});

module.exports = router;
