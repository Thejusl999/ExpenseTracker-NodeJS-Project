const express=require('express');
const router=express.Router();

const expenseController=require('../controllers/expense');

router.get('/expenses',expenseController.connectExpenses);
router.post('/expenses/addExpense',expenseController.addExpense);
router.get('/expenses/getExpenses',expenseController.getExpenses);
router.delete('/deleteExpense/:expenseId',expenseController.deleteExpense);

module.exports=router;