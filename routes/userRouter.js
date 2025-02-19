const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const userController = require('../controllers/userController');
const { registerValidation, sendMailVerificationValidation, passwordResetValidation, loginValidation, upadateProfileValidation, otpMailValidation, verifyOtpValidation } = require('../helpers/validations');
const auth = require('../middleware/auth');
const { title } = require('process');

// Middleware para analisar JSON
router.use(express.json());

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
            cb(null, path.join(__dirname, '../public/image'));
        } else {
            cb({ message: 'Este arquivo não é uma imagem válida' }, false);
        }


    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == 'image/jpeg' || file.mimetype == 'image/png') {
        cb(null, true);
    } else {
        cb({ message: 'Este arquivo não é uma imagem válida' }, false);
    }
}
const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});


router.get("/", (req, res) => {
    res.render("home", { title: "Home" })
})

// Rota para registro de usuários
router.post('/register', upload.single('image'), registerValidation, userController.userRegister);
router.get('/register', (req, res) => {
    res.render('register', {
        errors: req.flash('errors'),
        success: req.flash('success'),
        title: "Register"
    });
});

router.post('/send-mail-verification', sendMailVerificationValidation, userController.sendMailVerification);

router.post('/forgot-password',upload.none(), passwordResetValidation, userController.forgotPassword);
router.get('/forgot-password',(req,res)=>{
    res.render('forgot-password', {
        errors: req.flash('errors'),
        success: req.flash('success'),
        title: "Redifinir senha"
    });
})

// Rota de login
router.post('/login',upload.none(), loginValidation, userController.loginUser);
router.get('/login', (req, res) => {
    res.render('login', {
        errors: req.flash('errors'),
        success: req.flash('success'),
        title: "Login"
    })
})

// autenticação de rotas
router.get('/profile', auth, userController.userProfile);
router.post('/update-profile', auth, upload.single('image'), upadateProfileValidation, userController.updateProfile);

router.get('/refresh-token', auth, userController.refreshToken);
router.get('/logout', auth, userController.logout);


//otp vericação routes
router.post('/send-otp', otpMailValidation, userController.sendOtp);
router.post('/verify-otp', verifyOtpValidation, userController.verifyOtp)


module.exports = router;



