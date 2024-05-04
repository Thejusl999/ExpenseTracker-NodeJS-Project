const path = require("path");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const sequelize=require('../util/database');

const sendInBlue=require('sib-api-v3-sdk');
const client=sendInBlue.ApiClient.instance;
const apiKey=client.authentications['api-key'];
apiKey.apiKey=process.env.API_KEY;
const transEmailApi=new sendInBlue.TransactionalEmailsApi();

const {v4:UUIDV4} = require('uuid');
const ForgotPasswordReq=require('../models/ForgotPasswordReq');

exports.signupUser = async (req, res, next) => {
  const transact=await sequelize.transaction();
  const { name, email, password } = req.body;
  const newUser = { name, email, password };
  try {
    const hash = await bcrypt.hash(newUser.password, 10);
    await User.create({ ...newUser, password: hash },{transaction:transact});
    await transact.commit();
    res.status(200).json({ success: true, newUser });
  } catch (err) {
    if (err.original.code === "ER_DUP_ENTRY") {
      await transact.rollback();
      return res.status(403).json({ success: false, error: err.original.code });
    } else {
      await transact.rollback();
      return res.status(500).json({ success: false, error: err });
    }
  }
};

exports.connectSignup = async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "html", "signup.html"));
};

function generateToken(id, name) {
  return jsonwebtoken.sign({ userId: id, username: name }, process.env.JWTSECRETKEY);
}

exports.loginUser = async (req, res, next) => {
  const transact=await sequelize.transaction();
  const { email, password } = req.body;
  const fetchedUser = { email, password };
  try {
    const user = await User.findAll({ where: { email: email },transaction:transact });
    if (user.length > 0 && fetchedUser.email === user[0].email) {
      const result = await bcrypt.compare(
        fetchedUser.password,
        user[0].password
      );
      if (result) {
        await transact.commit();
        return res.status(200).json({
          success: true,
          message: "User logged in successfully!",
          token: generateToken(user[0].id, user[0].name),
          isPremium: user[0].isPremium,
        });
      } else {
        await transact.commit();
        return res.status(401).json({ success:false,error: "Incorrect password. Please try again!" });
      }
    } else {
      await transact.commit();
      return res.status(404).json({ success:false,error: "User not found. Please try again!" });
    }
  } catch (err) {
    await transact.rollback();
    return res.status(500).json({ success:false,error: 'Internal server error' });
  }
};

exports.connectLogin = async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "html", "login.html"));
};

exports.connectForgotPassword=(req,res,next)=>{
  res.sendFile(path.join(__dirname, "..", "public", "html", "forgotPassword.html"));
}

exports.forgotPassword=async(req,res,next)=>{
  const transact=await sequelize.transaction();
  const {email}=req.body;
  const sender={
    email:'expenses@gmail.com'
  };
  const receivers=[{
    email:email
  }];
  try{
    const user=await User.findOne({where:{email:email},transaction:transact});
    const {id,name}=user.dataValues;
    let uuid=UUIDV4();
    await transEmailApi.sendTransacEmail({
      sender,
      to:receivers,
      subject: 'Reset Your Password',
      textContent:`
      Hello ${name},\n\nYou recently requested to reset your password for your account. Click the link below to reset it:\n\nhttp://51.21.2.190:3000/user/resetpassword/${uuid}\n\nIf you did not request a password reset, please ignore this email or reply to let us know. This link is only valid once.\n\nThanks,\nExpense Tracker`
    });
    await ForgotPasswordReq.create({id:uuid,userId:id,isActive:true});
    await transact.commit();
    res.status(200).json({ success: true });
  }catch(err){
    await transact.rollback();
    console.log(err);
  }
}

exports.connectResetPassword=async(req,res,next)=>{
  const transact=await sequelize.transaction();
  const {resetId}=req.params;
  try{
    const request=await ForgotPasswordReq.findOne({where:{id:resetId},transaction:transact});
    const {isActive}=request.dataValues;
    if(isActive){
      await transact.commit();
      res.sendFile(path.join(__dirname, "..", "public", "html", "resetPassword.html"));
    }else{
      await transact.commit();
      const alertHTML = `
        <script>
          alert("Reset Password link has expired!"); 
          window.location.href = "/user/forgotPassword";
        </script>
      `;
      return res.status(403).send(alertHTML);
    }
  }catch(err){
    await transact.rollback();
    console.log(err);
  }
}

exports.resetPassword=async(req,res,next)=>{
  const transact=await sequelize.transaction();
  const {password}=req.body;
  const {resetId}=req.params;
  try{
    const request=await ForgotPasswordReq.findOne({where:{id:resetId},transaction:transact});
    const {userId}=request.dataValues;
    const user=await User.findOne({where:{id:userId},transaction:transact});
    const hash = await bcrypt.hash(password, 10);
    await user.update({password:hash},{transaction:transact});
    await request.update({isActive:false},{transaction:transact});
    await transact.commit();
    return res.status(200).json({ success: true, message:'Password changed successfully!' });
  }catch(err){
    await transact.rollback();
    return res.status(500).json({ success: false, error:err });
  }
}