const express=require('express');
const router=express.Router();

const premiumController=require('../controllers/premium');
const userAuthentication=require("../middlewares/authentication");

router.get('/premium/buyPremium',userAuthentication,premiumController.buyPremium);
router.post('/premium/updateStatus',userAuthentication,premiumController.updateStatus);
router.get('/premium/showLeaderboard',userAuthentication,premiumController.showLeaderboard);
router.get('/premium/downloadExpenses',userAuthentication,premiumController.downloadExpenses);
router.get('/premium/getDownloads',userAuthentication,premiumController.getDownloads);

module.exports=router;