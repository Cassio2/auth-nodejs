require('dotenv').config();
const express=require('express');
const app=express();
const mongoose=require('mongoose');


// Configurar o EJS como o mecanismo de template
app.set('view engine', 'ejs');

// START Connectando com BD
mongoose.connect('mongodb://localhost:27017/auth')
.then(() => {
    console.log('Database connected successfully');
})
.catch((error) => {
    console.error('Database connection failed:', error);
});
// END Connectando com BD

// Rota de teste
app.get('/', (req, res) => {
    res.send('Servidor está funcionando!');
});
// Rotas
app.use('/user',require('./routes/userRouter'));
app.use('/',require('./routes/authRouter'));
// end Rota 

const PORT=process.env.PORT||3000
app.listen(PORT,()=>{
    console.log('servidor rodando na porta 3663');
});