const Blacklist = require('../models/blacklistModel');
const jwt = require('jsonwebtoken');
const config = process.env;

const verifyToken = async (req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['authorization'];
    if (!token) {
        return res.status(403).json({ message: 'Um token e necesario para aceder a esta pagina' });
    }
    try {
        const bearer = token.split(' ');
        const bearerToken = bearer[1];

        const blacklistedToken = await Blacklist.findOne({ token: bearerToken });
        if (blacklistedToken) {
            return res.status(403).json({
                success: false,
                message: 'Esta sessão esta expirada, por favor faça login novamente'
            })
        }

        const decodedData = jwt.verify(bearerToken, config.ACCESS_TOKEN_SECRET);
        req.user = decodedData;
    }
    catch (err) {
        return res.status(403).json({
            success: false,
            message: 'Token inválido'
        })
    }

    return next();
}

module.exports = verifyToken;