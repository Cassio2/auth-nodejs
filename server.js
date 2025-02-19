require('dotenv').config();
const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
const path = require("path")
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.engine('handlebars', engine({
    defaultLayout: 'main',
    handlebars: require('handlebars'),
    runtimeOptions: {
        allowProtoPropertiesByDefault: true, // Permite acesso a propriedades no protótipo
        allowProtoMethodsByDefault: true     // Permite acesso a métodos no protótipo
    }
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'seu-segredodd',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

// START Connectando com BD
mongoose.connect('mongodb://localhost:27017/auth')
    .then(() => {
        console.log('Database connected successfully');
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
    });


// Rotas
app.use('/', require('./routes/userRouter'));
app.use('/', require('./routes/authRouter'));


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log('servidor rodando na porta 3663');
});