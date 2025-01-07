const mongoose=require('mongoose');

const userSchema=new mongoose.Schema({ 
    name:{type:String,required:true},
    email:{type:String,required:true},
    password:{type:String,required:true},
    image:{type:String,required:true},
    is_verified:{type:Number,default:0}, // 0=nao verificado, 1=verificado
    mobile:{type:String,required:true},
});

module.exports=mongoose.model('User',userSchema);