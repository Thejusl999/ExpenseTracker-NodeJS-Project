const jsonwebtoken=require("jsonwebtoken");
const User=require("../models/User");
const secretKey=require('../util/secretKey');

const authenticate=(req,res,next)=>{
    try{
        const token=req.header('Authorization');
        const user=jsonwebtoken.verify(token,secretKey);
        User.findByPk(user.userId)
            .then(user=>{
                req.user=user;
                next();
            })
    }
    catch(err){
        console.log(err);
        return res.status(401).json({success:true});
    }
}

module.exports=authenticate;