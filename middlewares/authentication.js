const jsonwebtoken=require("jsonwebtoken");
const User=require("../models/User");
const secretKey=require('../util/secretKey');

const authenticate=async(req,res,next)=>{
    try{
        const token=req.header('Authorization');
        const user=jsonwebtoken.verify(token,secretKey);
        const userData=await User.findByPk(user.userId);
        if(userData){
            req.user=userData;
            next();
        }else{
            return res.status(401).json({success:false,message:'User not found'});
        }
    }
    catch(err){
        return res.status(401).json({success:false,message:'User not found'});
    }
}

module.exports=authenticate;