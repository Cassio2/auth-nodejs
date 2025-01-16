const express = require('express');
const router = express.Router(); 
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const { registerValidation, sendMailVerificationValidation, passwordResetValidation,loginValidation } = require('../helpers/validations');
const auth = require('../middleware/auth');

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
router.post('/send-mail-verification', sendMailVerificationValidation, userController.sendMailVerification);
router.post('/forgot-password',passwordResetValidation,userController.forgotPassword);

// Rota de login
router.post('/login',loginValidation, userController.loginUser);

// autenticação de rotas
router.get('/profile',auth, userController.userProfile);

module.exports = router;
