const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({  
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // Use true para SSL (porta 465)
    auth: {
        user: process.env.SMTP_EMAIL, // Certifique-se de que isso é igual ao remetente
        pass: process.env.SMTP_PASSWORD
    },
    tls: {
        rejectUnauthorized: false // Apenas em desenvolvimento
    }
});

const sendMail = async (email, subject, content) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_EMAIL, // Deve ser o mesmo que `auth.user`
            to: email,
            subject: subject,
            html: content
        };

        const info = await transporter.sendMail(mailOptions); // Use `await` para promessas
        console.log('E-mail enviado:', info.response);
    } catch (error) {
        console.log('Erro ao enviar e-mail:', error.message);
    }
};

module.exports = { sendMail };
