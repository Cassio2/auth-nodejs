const { check } = require('express-validator');

exports.registerValidation = [
    check('name').isLength({ min: 3 }).withMessage('O nome deve ter no mínimo 3 caracteres'),
    check('email').isEmail().normalizeEmail({ gmail_remove_dots: true }).withMessage('O e-mail informado não é válido'),
    check('mobile').isLength({
        min: 9,
        max: 9
    }).withMessage('O número de telefone deve ter 9 dígitos'),

    check('password').isStrongPassword({
        minLength: 1,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }).withMessage('A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial'),

    check('image').custom((value, { req }) => {
        if (!req.file) {
            throw new Error('A imagem é obrigatória');
        }
        else if(req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/png') {
           return true;
        } else {
            return false;
        }
    }).withMessage('a imagem deve ser do tipo jpeg ou png')
]

exports.sendMailVerificationValidation = [
    check('email').isEmail().normalizeEmail({ gmail_remove_dots: true }).withMessage('O e-mail informado não é válido')
]

exports.passwordResetValidation = [
    check('email').isEmail().normalizeEmail({ gmail_remove_dots: true }).withMessage('O e-mail informado não é válido')
]

exports.loginValidation = [
    check('email').isEmail().normalizeEmail({ gmail_remove_dots: true }).withMessage('O e-mail informado não é válido'),
    check('password').not().isEmpty().withMessage('A senha é obrigatória'),
    // check('password').isStrongPassword({
    //     minLength: 1,
    //     minLowercase: 1,
    //     minUppercase: 1,
    //     minNumbers: 1,
    //     minSymbols: 1
    // }).withMessage('A senha deve ter no mínimo 8 caracteres, 1 letra maiúscula, 1 letra minúscula, 1 número e 1 caractere especial')
]