const path = require("path");
const Expense = require("../models/Expense");

exports.connectExpenses = async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "html", "expenses.html"));
};

exports.addExpense = async (req,res,next)=>{
  const newExpense={
      amount:req.body.amount,
      description:req.body.description,
      category:req.body.category,
      userId:req.user.id
  }
  Expense.create(newExpense)
      .then(result=>{
          res.status(200).json(newExpense);
      })
      .catch(err=>console.log(err));
};

exports.getExpenses = async (req,res,next)=>{
  const expenses=await Expense.findAll({where:{userId:req.user.id}})
  res.status(200).json(expenses);
};

exports.deleteExpense = async (req,res,next)=>{
  const expenseId=req.params.expenseId;
  Expense.findByPk(expenseId)
      .then(product=>{
          product.destroy();
      })
      .catch(err=>console.log(err));
  res.status(200).json({message:'expense deleted!'});
};