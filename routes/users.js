const express=require('express');
const router=express.Router();

const userController=require('../controllers/user');

router.get('/user/signup',userController.connectSignup);
router.post('/user/signup',userController.signupUser);
router.get('/user/login',userController.connectLogin);
router.post('/user/login',userController.loginUser);
router.get('/password/forgotpassword',userController.connectForgotPassword);
router.post('/password/forgotpassword',userController.forgotPassword);
router.get('/password/resetpassword/:resetId',userController.connectResetPassword);
router.post('/password/resetpassword/:resetId',userController.resetPassword);

module.exports=router;