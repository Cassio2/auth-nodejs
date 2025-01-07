const User = require('../models/userModel')
const bcrypt = require('bcrypt');

const userRegister = async (req, res) => {

    try { 
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

        return res.status(200).json({ sucess:true, message: "Usuario registado com sucesso", dadosUsuario: userData });

    } catch (error) {
        return res.status(400).json({sucess:false, message: error.message });
    }

}


module.exports = { userRegister }