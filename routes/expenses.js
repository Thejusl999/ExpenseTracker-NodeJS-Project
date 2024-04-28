const express=require('express');
const router=express.Router();

const expenseController=require('../controllers/expense');
const userAuthentication=require("../middlewares/authentication");

router.get('/',expenseController.connectExpenses);
router.post('/addExpense',userAuthentication,expenseController.addExpense);
router.get('/getExpenses',userAuthentication,expenseController.getExpenses);
router.delete('/deleteExpense/:expenseId',expenseController.deleteExpense);

module.exports=router;