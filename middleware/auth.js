const jwt=require('jsonwebtoken');
const config=process.env;

const verifyToken=(req,res,next)=>{
    const token =req.body.token||req.query.token||req.headers['authorization'];
    if(!token){
        return res.status(403).json({message:'Um token e necesario para aceder a esta pagina'});
    }
    try{
        const bearer=token.split(' '); 
        const bearerToken=bearer[1];   
        const decodedData=jwt.verify(bearerToken,config.ACCESS_TOKEN_SECRET);
        req.user=decodedData;
    }
    catch(err){
        return res.status(403).json({
            success: false,
            message:'Token inválido'})
    }

    return next();
}

module.exports=verifyToken;