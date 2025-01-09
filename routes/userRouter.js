const express = require('express');
const router = express.Router(); 
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const { registerValidation } = require('../helpers/validations');

// Middleware para analisar JSON
router.use(express.json());

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
            cb(null, path.join(__dirname, '../public/image'));
        } else {        
            cb({message: 'Este arquivo não é uma imagem válida'}, false);
        }

        
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb({message: 'Este arquivo não é uma imagem válida'}, false);
    }
}   
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter});

// Rota para registro de usuários
router.post('/register', upload.single('image'), registerValidation, userController.userRegister);

// Rota de login para teste
router.get('/login', (req, res) => {
    res.send('Login');
});

module.exports = router;
