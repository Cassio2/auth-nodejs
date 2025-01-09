const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const mailer = require('../helpers/mailer');

const userRegister = async (req, res) => {

    try {

        const erros = validationResult(req);

        if (!erros.isEmpty()) {
            return res.status(400).json({ sucess: false, message: 'Erros', erros: erros.array() });
        }

        const { name, email, password, mobile } = req.body;
        const image = req.file.filename;

        // Verificando se o email já está cadastrado
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({ sucess: false, message: "Email já cadastrado" });
        }
        // criptografando a senha
        const hashPassword = await bcrypt.hash(password, 10)

        const user = new User({ name, email, password: hashPassword, image, mobile })
        const userData = await user.save();

        const msg = '<p>Olá, ' + name + ', Por favor <a href="http://localhost:3363/mail-verification?id=' + userData._id + '">verifique</a> o seu email</p>';
        mailer.sendMail(email, 'Verificação de email', msg);

        return res.status(200).json({ sucess: true, message: "Usuario registado com sucesso", dadosUsuario: userData });

    } catch (error) {
        return res.status(400).json({ sucess: false, message: error.message });
    }

}

const mailVerification = async (req, res) => {
    try {
        if (req.query.id == undefined) {
            console.log('Id não definido')
            return res.render('404');
        }

        const userData = await User.findOne({_id:req.query.id});

        if (userData) {

            if (userData.is_verified == 1) {
                return res.render('mail-verification', { message: 'Email já verificado' });
            }

           await User.findByIdAndUpdate({_id:req.query.id}, {
            $set: {
                is_verified: 1
            }
        });
        return res.render('mail-verification', { message: 'Email verificado com sucesso' });
        }
        else {
            return res.render('mail-verification', { message: 'Usuário não encontrado' });
        }
    }catch (erro) {
        console.log(erro.message)
        return res.render('404');
    }
}

const sendMailVerification = async (req, res) => {
    try{
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.status(400).json({ sucess: false, message: 'ErrosendMailVeri', erros: erros.array() });
        }
        const { email } = req.body;
        const userData= await User.findOne({email:email});

        if(!userData){
            return res.status(400).json({ sucess: false, message: "Email não encontrado" });
        }
        if(userData.is_verified==1){
            return res.status(400).json({ sucess: false, message: userData.email+", Email já verificado" });
        }

        const msg = '<p>Olá, ' + userData.name + ', Por favor <a href="http://localhost:3363/mail-verification?id=' + userData._id + '">verifique</a> o seu email</p>';
        mailer.sendMail(userData.email, 'Verificação de email', msg);

        return res.status(200).json({ sucess: true, message: "link de verificação enviado para o seu e-mail, por favor, verifique" });
        // return res.status(200).json({ sucess: true, message: "Usuario registado com sucesso", dadosUsuario: userData });

    }
    catch (erro) {
        console.log(erro.message)
        return res.render('404');
    }
}

module.exports = { userRegister, mailVerification, sendMailVerification }