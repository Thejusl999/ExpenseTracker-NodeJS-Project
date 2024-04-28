const express=require('express');
const router=express.Router();

const userController=require('../controllers/user');

router.get('/signup',userController.connectSignup);
router.post('/signup',userController.signupUser);
router.get('/login',userController.connectLogin);
router.post('/login',userController.loginUser);
router.get('/forgotpassword',userController.connectForgotPassword);
router.post('/forgotpassword',userController.forgotPassword);
router.get('/resetpassword/:resetId',userController.connectResetPassword);
router.post('/resetpassword/:resetId',userController.resetPassword);

module.exports=router;