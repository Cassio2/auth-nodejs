const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const mailer = require('../helpers/mailer');
const passwordReset = require('../models/passwordReset')
const randomstring = require('randomstring');
const jwt = require('jsonwebtoken');
const { deleteFile } = require('../helpers/deleteFile');
const path = require('path');
const Blacklist = require('../models/blacklistModel');
const Otp = require('../models/otp');
const otp = require('../models/otp');
const { UmMinutoExprira, threeMinutoExprira } = require('../helpers/OtpValidation');

// Função para registrar o usuário
const userRegister = async (req, res) => {
    try {
        const erros = validationResult(req);

        if (!erros.isEmpty()) {
            // Extrai apenas as mensagens de erro
            const errors = erros.array().map((error) => error.msg);

            // Armazena os erros na sessão usando flash
            req.flash('errors', errors);

            // Redireciona de volta para a página de registro
            return res.redirect('/register');
        }

        // Extraindo os dados do corpo da requisição
        const { name, email, password, mobile } = req.body;
        const image = req.file?.filename; // Verifica se o arquivo existe

        // Verificando se o email já está cadastrado
        const userExist = await User.findOne({ email });
        if (userExist) {
            req.flash('errors', ['Email já cadastrado']); // Armazena o erro na sessão
            return res.redirect('/register');
        }

        // Criptografando a senha
        const hashPassword = await bcrypt.hash(password, 10);

        // Criando o novo usuário
        const user = new User({ name, email, password: hashPassword, image, mobile });
        const userData = await user.save();

        // Enviando email de verificação
        const msg = `<p>Olá, ${name}, por favor <a href="http://localhost:3363/mail-verification?id=${userData._id}">verifique</a> o seu email</p>`;
        mailer.sendMail(email, 'Verificação de email', msg);

        req.flash('success', 'Usuário registrado com sucesso,Enviamos uma mensagem para o seu Email por favor verifique');
        return res.redirect('/register');

    } catch (error) {
        req.flash('errors', [error.message]);
        return res.redirect('/register');
    }
};

// Função para verificar o email
const mailVerification = async (req, res) => {
    try {
        if (req.query.id == undefined) {
            console.log('Id não definido');
            return res.render('404');
 
        }

        const userData = await User.findOne({ _id: req.query.id });

        if (userData) {
            if (userData.is_verified == 1) {
                return res.render('mail-verification', { message: 'Email já verificado' });
            }

            await User.findByIdAndUpdate({ _id: req.query.id }, {
                $set: { is_verified: 1 }
            });

            return res.render('mail-verification', { message: 'Email verificado com sucesso' });
         
        } else {
            return res.render('mail-verification', { message: 'Usuário não encontrado' });
        }
    } catch (erro) {
        console.log(erro.message)
        return res.render('404');
    }
};

// Função para enviar o link de verificação
const sendMailVerification = async (req, res) => {
    try {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.status(400).json({ sucess: false, message: 'ErrosendMailVeri', erros: erros.array() });
        }
        const { email } = req.body;
        const userData = await User.findOne({ email: email });

        if (!userData) {
            return res.status(400).json({ sucess: false, message: "Email não encontrado" });
        }
        if (userData.is_verified == 1) {
            return res.status(400).json({ sucess: false, message: userData.email + ", Email já verificado" });
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

// Função para confirmar email de usuario e enviar link de cofirmação
const forgotPassword = async (req, res) => {
    try {
        // console.log(req.body)
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            const errorMessages = erros.array().map((error) => error.msg);
            req.flash('errors', errorMessages);
            return res.redirect('/forgot-password');
        }

        const { email } = req.body;
        const userData = await User.findOne({ email: email });

        // Verifica se o e-mail existe no banco de dados
        if (!userData) {
            req.flash('errors', ['Email não encontrado']);
            return res.redirect('/forgot-password');
        }

        // Gera o token de redefinição de senha
        const randomString = randomstring.generate(20);
        const message = `
            <p>Olá, ${userData.name},</p>
            <p>Por favor, <a href="http://localhost:3363/reset-password?token=${randomString}">clique aqui</a> para redefinir a sua senha.</p>
        `;

        // Remove tokens antigos e cria um novo token
        await passwordReset.deleteMany({ user_id: userData._id });
        const passwordResetData = new passwordReset({
            user_id: userData._id,
            token: randomString
        });

        await passwordResetData.save();

        // Envia o e-mail com o link de redefinição
        mailer.sendMail(userData.email, 'Redefinição de senha', message);

        req.flash('success', ['Link de redefinição de senha enviado para o seu e-mail. Por favor, verifique.']);
        return res.redirect('/forgot-password');
    } catch (erro) {
        console.error('Erro:', erro.message);
        req.flash('errors', ['Erro interno do servidor']);
        return res.redirect('/forgot-password');
    }
};

// Função para exibir a página de redefinição de senha
const resetPassword = async (req, res) => {
    try {
        if (req.query.token == undefined) { //verificando se o token foi definido
            console.log('Token não definido')
            return res.render('404');
        }

        const passwordResetData = await passwordReset.findOne({ token: req.query.token }); //procurando o token no banco de dados
        if (!passwordResetData) { //verificando se o token existe
            console.log('Token não encontrado')
            return res.render('404');
        }

        return res.render('reset-password', { passwordResetData }); //renderizando a página de redefinição de senha 


    } catch (erro) {
        console.log(erro.message)
        return res.render('404');
    }
}

// Função para atualizar a senha
const updatePassword = async (req, res) => {
    try {
        const { user_id, password, password2 } = req.body;

        // Buscar o passwordResetData com base no user_id
        const passwordResetData = await passwordReset.findOne({ user_id });

        // Verificar se o token é válido
        if (!passwordResetData) {
            return res.status(400).send('Token inválido ou expirado.');
        }

        // Verificar se as senhas coincidem
        if (password !== password2) {
            return res.render('reset-password', { passwordResetData, messageError: "As senhas não coincidem" });
        }

        // Criptografar a nova senha
        const hashPassword = await bcrypt.hash(password2, 10);

        // Atualizar a senha do usuário no banco de dados
        await User.findByIdAndUpdate({ _id: user_id }, { $set: { password: hashPassword } });

        // Deletar o token após a atualização da senha
        await passwordReset.deleteOne({ user_id });

        // Redirecionar para a página de sucesso após a atualização da senha
        return res.redirect('/reset-success');
    }
    catch (erro) {
        console.log(erro.message);
        return res.render('404'); // Caso ocorra algum erro, exibe página 404
    }
}

// Função para exibir a página de sucesso após a atualização da senha
const resetSuccess = async (req, res) => {
    try {
        return res.render('reset-success');
    }
    catch (erro) {
        console.log(erro.message)
        return res.render('404');
    }
}

// Função para gerar o token de acesso
const generateAccessToken = (user) => {
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2h' });
    return token;
}

const generateRefreshToken = (user) => {
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '4h' });
    return token;
}

// Função para efetuar o login
const loginUser = async (req, res) => {
    try {
        const erros = validationResult(req);

        if (!erros.isEmpty()) {
            const errors = erros.array().map((error) => error.msg);
            req.flash('errors', errors);
            return res.redirect('/login');
        }

        const { email, password } = req.body;
        const userData = await User.findOne({ email });

        if (!userData) {
            req.flash('errors', ['Email não encontrado']);
            return res.redirect('/login');
        }

        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            req.flash('errors', ['Senha incorreta']);
            return res.redirect('/login');
        }

        if (userData.is_verified == 0) {
            req.flash('errors', ['Email não verificado']);
            return res.redirect('/login');
        }

        // Gera os tokens
        const AccessToken = await generateAccessToken({ user: userData });
        const RefreshToken = await generateRefreshToken({ user: userData });

        // Retorna os tokens como resposta JSON
        return res.status(200).json({
            success: true,
            message: 'Login efetuado com sucesso',
            user: {
                id: userData.id,
                email: userData.email,
                name: userData.name
            },
            AccessToken,
            RefreshToken,
            tokenType: 'Bearer'
        });

    } catch (error) {
        console.error('Erro no login:', error.message);
        req.flash('errors', [error.message]);
        return res.redirect('/login');
    }
};


// Função para exibir o perfil do usuário
const userProfile = async (req, res) => {
    try {
        // const user = req.user;
        return res.status(200).json({ sucess: true, message: "Perfil do usuário", DadosDoUsuario: req.user.user });
    } catch (erro) {
        return res.status(400).json({ sucess: false, message: erro.message });
    }
}

// Função para atualizar o perfil do usuário
const updateProfile = async (req, res) => {
    try {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.status(400).json({
                sucess: false,
                message: 'Erros de validação',
                erros: erros.array()
            });
        }

        const { name, mobile } = req.body;
        const data = { name, mobile };
        const id = req.user.user._id;

        // Se houver um arquivo, tratamos a imagem
        if (req.file !== undefined) {
            data.image = 'image/' + req.file.filename;

            const oldUser = await User.findOne({ _id: id });
            const oldFilePath = path.join(__dirname, '../public/image/' + oldUser.image);
            deleteFile(oldFilePath); // Deletando a imagem antiga
        }

        // Atualizando o usuário no banco de dados
        const userData = await User.findByIdAndUpdate({ _id: id }, {
            $set: data
        }, { new: true });

        return res.status(200).json({
            sucess: true,
            message: "Perfil atualizado com sucesso",
            DadosDoUsuario: userData
        });

    } catch (erro) {
        return res.status(400).json({
            sucess: false,
            message: erro.message,
        });
    }
}

const refreshToken = async (req, res) => {
    try {
        const userId = req.user.user._id;
        const UserData = await User.findOne({ _id: userId });

        const AccessToken = await generateAccessToken({ user: UserData });
        const refreshToken = await generateRefreshToken({ user: UserData });

        return res.status(200).json({
            sucess: true,
            message: 'Token atualizado com sucesso',
            AccessToken: AccessToken,
            RefreshToken: refreshToken,

        });
    }
    catch (erro) {
        return res.status(400).json({ sucess: false, message: erro.message })
    }
}

const logout = async (req, res) => {
    try {
        const token = req.body.token || req.query.token || req.headers['authorization'];
        const bearer = token.split(' ');
        const bearerToken = bearer[1];

        const newBlacklist = new Blacklist({
            token: bearerToken
        });

        await newBlacklist.save();

        res.setHeader('Clear-Site-Data', '"cookies","storage"');
        return res.status(200).json({ sucess: true, message: 'Logout efetuado com sucesso' });
    }
    catch (erro) {
        return res.status(400).json({ sucess: false, message: erro.message })
    }
}

const generateRandon4Digit = async () => {
    return Math.floor(1000 + Math.random() * 9000);
}
const sendOtp = async (req, res) => {
    try {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.status(400).json({ sucess: false, message: 'ErrosendOtp', erros: erros.array() });
        }
        const { email } = req.body;
        const userData = await User.findOne({ email: email });

        if (!userData) {
            return res.status(400).json({ sucess: false, message: "Email não encontrado" });
        }
        if (userData.is_verified == 1) {
            return res.status(400).json({ sucess: false, message: userData.email + ", Email já verificado" });
        }

        const g_otp = await generateRandon4Digit();

        const oldOtpDate = await Otp.findOne({ user_id: userData._id });

        if (oldOtpDate) {
            const sendNextOtp = await UmMinutoExprira(oldOtpDate.timestamps);
            if (!sendNextOtp) {
                return res.status(400).json({
                    sucess: false,
                    message: "Por favor, aguarde 1 minuto para enviar o próximo otp"
                });
            }
        }
        const c_Date = new Date();

        await Otp.findOneAndUpdate(
            { user_id: userData._id },
            { otp: g_otp, timestamps: new Date(c_Date.getTime()) },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );



        const msg = '<p>Olá, <b>' + userData.name + '</b> </br> <h4>' + g_otp + '</h4>  </p>';
        mailer.sendMail(userData.email, 'Verificação de otp', msg);

        return res.status(200).json({ sucess: true, message: "otp foi enviado para o seu e-mail, por favor verifique" });

    }
    catch (erro) {
        return res.status(400).json({ sucess: false, message: erro.message })
    }
}

const verifyOtp = async (req, res) => {
    try {
        const erros = validationResult(req);
        if (!erros.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Erros de validação',
                erros: erros.array()
            });
        }

        const { user_id, otp } = req.body;

        const otpDate = await Otp.findOne({
            user_id,
            otp
        });

        if (!otpDate) {
            return res.status(400).json({
                success: false,
                msg: 'Digitou OTP errado'
            });
        }

        const eOtpExpirado = await threeMinutoExprira(otpDate.timestamps);

        if (eOtpExpirado) {
            return res.status(400).json({
                success: false,
                msg: 'Seu OTP expirou'
            });
        }

        await User.findByIdAndUpdate(
            { _id: user_id },
            { $set: { is_verified: 1 } }
        );

        return res.status(200).json({
            success: true,
            msg: 'Conta verificada com sucesso'
        });

    } catch (erro) {
        return res.status(400).json({ success: false, message: erro.message });
    }
};


module.exports = {
    userRegister,
    mailVerification,
    sendMailVerification,
    forgotPassword,
    resetPassword,
    updatePassword,
    resetSuccess,
    loginUser,
    userProfile,
    updateProfile,
    refreshToken,
    logout,
    sendOtp,
    verifyOtp
}