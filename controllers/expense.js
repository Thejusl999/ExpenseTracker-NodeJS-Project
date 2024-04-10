const path = require("path");
const User = require("../models/User");
const Expense = require("../models/Expense");

exports.connectExpenses = async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "html", "expenses.html"));
};

exports.addExpense = async (req, res, next) => {
  User.findOne({ where: { id: req.user.id } })
    .then((user) => {
      if (user.dataValues.totalExpense === null) {
        user.update({ totalExpense: Number(req.body.amount) });
      } else {
        user.update({
          totalExpense: user.dataValues.totalExpense + Number(req.body.amount),
        });
      }
      req.user.update({ totalExpense: user.dataValues.totalExpense });
    })
    .catch((err) => console.log(err));
  const newExpense = {
    amount: req.body.amount,
    description: req.body.description,
    category: req.body.category,
    userId: req.user.id,
  };
  Expense.create(newExpense)
    .then((result) => {
      res.status(200).json(newExpense);
    })
    .catch((err) => console.log(err));
};

exports.getExpenses = async (req, res, next) => {
  const expenses = await Expense.findAll({ where: { userId: req.user.id } });
  res.status(200).json(expenses);
};

exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params.expenseId;
  Expense.findByPk(expenseId)
    .then((product) => {
      User.findByPk(product.dataValues.userId)
        .then((user) => {
          user.update({
            totalExpense:
              user.dataValues.totalExpense - Number(product.dataValues.amount),
          });
        })
        .then(() => product.destroy())
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
  res.status(200).json({ message: "expense deleted!" });
};
