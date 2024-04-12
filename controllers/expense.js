const path = require("path");
const User = require("../models/User");
const Expense = require("../models/Expense");
const sequelize = require("../util/database");

exports.connectExpenses = async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "html", "expenses.html"));
};

exports.addExpense = async (req, res, next) => {
  const transact = await sequelize.transaction();
  const newExpense = {
    amount: req.body.amount,
    description: req.body.description,
    category: req.body.category,
    userId: req.user.id,
  };
  try{
    await Expense.create(newExpense, { transaction: transact });
    const total=Number(req.user.totalExpense) + Number(newExpense.amount);
    await User.update(
      {
        totalExpense: total,
      },
      {
        where: { id: req.user.id },
        transaction: transact,
      }
    );
    await transact.commit();
    res.status(200).json({success:true,newExpense});
  }catch(err){
    await transact.rollback();
    return res.status(500).json({ success: false, error: err });
  }
};

exports.getExpenses = async (req, res, next) => {
  const expenses = await Expense.findAll({ where: { userId: req.user.id } });
  res.status(200).json(expenses);
};

exports.deleteExpense = async (req, res, next) => {
  const transact=await sequelize.transaction();
  const expenseId = req.params.expenseId;
  try{  
    const product=await Expense.findByPk(expenseId, { transaction: transact });
    const user=await User.findByPk(product.dataValues.userId, { transaction: transact });
    await user.update({
      totalExpense:
      user.dataValues.totalExpense -
      Number(product.dataValues.amount),
    });
    await transact.commit();
    product.destroy();
    res.status(200).json({ success:true,message: "expense deleted!" });
  }catch(err){
    await transact.rollback();
    return res.status(500).json({ success: false, error: err });
  }
};
