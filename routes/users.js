const express=require('express');
const router=express.Router();

const playerController=require('../controllers/user');

router.get('/user/signup',playerController.connectSignup);
router.post('/user/signup',playerController.signupUser);
router.get('/user/login',playerController.connectLogin);
router.post('/user/login',playerController.loginUser);

module.exports=router;