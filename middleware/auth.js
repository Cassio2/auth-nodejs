const Blacklist = require('../models/blacklistModel');
const jwt = require('jsonwebtoken');
const config = process.env;

const verifyToken = async (req, res, next) => {

    const token = req.headers['authorization'];
    console.log('Cabeçalhos da requisição:', req.headers);
console.log('Token no cabeçalho Authorization:', req.headers['authorization']);

    // O token é extraído do cabeçalho Authorization
    console.log('Token no header:', token);
    if (!token) {
        return res.status(403).json({ message: 'Um token é necessário para acessar esta página' });
    }
    try {
        const bearer = token.split(' ');  // Divide o token para pegar o "Bearer token"
        const bearerToken = bearer[1];  // O token real

        // Verifica se o token foi colocado na blacklist
        const blacklistedToken = await Blacklist.findOne({ token: bearerToken });
        if (blacklistedToken) {
            return res.status(400).json({
                success: false,
                message: 'Esta sessão está expirada, por favor faça login novamente'
            });
        }

        // Verifica o token JWT
        const decodedData = jwt.verify(bearerToken, config.ACCESS_TOKEN_SECRET);
        req.user = decodedData;  // Adiciona os dados decodificados do usuário na requisição
    } catch (err) {
        return res.status(403).json({
            success: false,
            message: 'Token inválido'
        });
    }

    return next();  // Continua para a próxima função (a rota)
};

module.exports = verifyToken;
