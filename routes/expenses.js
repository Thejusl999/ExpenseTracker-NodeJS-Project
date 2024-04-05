const express=require('express');
const router=express.Router();

const expenseController=require('../controllers/expense');
const userAuthentication=require("../middlewares/authentication");

router.get('/expenses',expenseController.connectExpenses);
router.post('/expenses/addExpense',userAuthentication,expenseController.addExpense);
router.get('/expenses/getExpenses',userAuthentication,expenseController.getExpenses);
router.delete('/deleteExpense/:expenseId',expenseController.deleteExpense);

module.exports=router;