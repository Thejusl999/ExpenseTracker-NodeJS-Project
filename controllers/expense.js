const path = require("path");
const User = require("../models/Expense");

exports.connectExpenses = async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "html", "expenses.html"));
};

exports.addExpense = async (req,res,next)=>{
  const newExpense={
      amount:req.body.amount,
      description:req.body.description,
      category:req.body.category
  }
  User.create(newExpense)
      .then(result=>{
          res.status(200).json(newExpense);
      })
      .catch(err=>console.log(err));
};

exports.getExpenses = async (req,res,next)=>{
  const expenses=await User.findAll()
  res.status(200).json(expenses);
};

exports.deleteExpense = async (req,res,next)=>{
  const expenseId=req.params.expenseId;
  User.findByPk(expenseId)
      .then(product=>{
          product.destroy();
      })
      .catch(err=>console.log(err));
  res.status(200).json({message:'expense deleted!'});
};