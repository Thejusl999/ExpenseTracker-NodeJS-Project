const express=require('express');
const router=express.Router();

const playerController=require('../controllers/user');

router.get('/user/signup',playerController.connectFrontend);
router.post('/user/signup',playerController.addUser);

module.exports=router;