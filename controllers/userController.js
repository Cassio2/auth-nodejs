const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const mailer = require('../helpers/mailer'); 

const userRegister = async (req, res) => {

    try {
        
        const erros = validationResult(req);

        if (!erros.isEmpty()) {
            return res.status(400).json({sucess:false, message:'Erros', erros:erros.array() });
        }

        const { name, email, password, mobile } = req.body;
        const image = req.file.filename;

        // Verificando se o email já está cadastrado
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({sucess:false, message: "Email já cadastrado" });
        }
            // criptografando a senha
        const hashPassword = await bcrypt.hash(password, 10)

        const user = new User({ name,email,password:hashPassword,image,mobile})
        const userData =await user.save();

        const msg= '<p>Olá, '+name+', Por favor <a href="http://localhost:3363/mail-verification?id='+userData._id+'">verifique</a> o seu email</p>';
        mailer.sendMail(email, 'Verificação de email', msg);

        return res.status(200).json({ sucess:true, message: "Usuario registado com sucesso", dadosUsuario: userData });

    } catch (error) {
        return res.status(400).json({sucess:false, message: error.message });
    }

}


module.exports = { userRegister }