const fs=require('fs').promises;

const deleteFile=async (filePath)=>{
    try{
        await fs.unlink(filePath);
        console.log('Arquivo deletado com sucesso')
    }
    catch(erro){
        console.log('Erro ao deletar arquivo',erro)
    }
}

module.exports={
    deleteFile
}