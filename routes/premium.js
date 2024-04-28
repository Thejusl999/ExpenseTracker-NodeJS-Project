const express=require('express');
const router=express.Router();

const premiumController=require('../controllers/premium');
const userAuthentication=require("../middlewares/authentication");

router.get('/buyPremium',userAuthentication,premiumController.buyPremium);
router.post('/updateStatus',userAuthentication,premiumController.updateStatus);
router.get('/showLeaderboard',userAuthentication,premiumController.showLeaderboard);
router.get('/downloadExpenses',userAuthentication,premiumController.downloadExpenses);
router.get('/getDownloads',userAuthentication,premiumController.getDownloads);

module.exports=router;