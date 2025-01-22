const UmMinutoExprira = async (otpTime) => {
    try {
        console.log('Otp expirara em - ' + otpTime)

        const c_dateTime = new Date()
        var diferenteValor = (otpTime - c_dateTime.getTime()) / 1000;
        diferenteValor /= 60;

        console.log('Minutos de expriração - ' + Math.abs(diferenteValor) )
        if (Math.abs(diferenteValor) > 1) {
            console.log('Otp expirou')
            return true;

        }

        console.log('Otp ainda é valido')
        return false;
    }
    catch (erro) {
        console.log('Erro ao verificar o tempo do otp', erro)
    }
}

const threeMinutoExprira = async (otpTime) => {
    try {
        console.log('Otp expirara em - ' + otpTime)

        const c_dateTime = new Date()
        var diferenteValor = (otpTime - c_dateTime.getTime()) / 1000;
        diferenteValor /= 60;

        console.log('Minutos de expriração - ' + Math.abs(diferenteValor) )
        if (Math.abs(diferenteValor) > 3) {
            console.log('Otp expirou')
            return true;

        }

        console.log('Otp ainda é valido')
        return false;
    }
    catch (erro) {
        console.log('Erro ao verificar o tempo do otp', erro)
    }
}

module.exports = {
    UmMinutoExprira, 
    threeMinutoExprira
}