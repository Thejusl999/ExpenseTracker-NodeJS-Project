const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Expense=require('../models/Expense');
const User=require('../models/User');

exports.buyPremium = (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.razorpayKey_id,
    key_secret: process.env.razorpayKey_secret,
  });

  razorpay.orders.create({ amount: 2500, currency: "INR" }, (err, order) => {
    if (err) {
      throw new Error(JSON.stringify(err));
    }
    req.user.createOrder({ orderId: order.id, status: "PENDING" }).then(() => {
      return res.status(201).json({ order, key_id: razorpay.key_id });
    });
  });
};

exports.updateStatus = (req, res) => {
  const { payment_id, order_id, status } = req.body;
  Order.findOne({ where: { orderId: order_id } })
    .then((order) => {
      if (!status) {
        const updateOrder = order.update({
          paymentID: payment_id,
          status: "SUCCESSFUL",
        });
        const updateUser = req.user.update({ isPremium: true });

        return Promise.all([updateOrder, updateUser]).then(() => {
          return res
            .status(202)
            .json({ success: true, message: "Transaction Successful!" });
        });
      } else {
        return order.update({ status: "FAILED" }).then(() => {
          return res
            .status(402)
            .json({
              success: false,
              message: "Transaction Failed. Please retry!",
            });
        });
      }
    })
    .catch((err) => {
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error!" });
    });
};

exports.showLeaderboard=(req,res)=>{
  Expense.findAll()
    .then(async(expenses)=>{
      const promise=expenses.map(expense=>{
        return User.findByPk(expense.userId)
          .then(response=>{
            expense={...expense.dataValues,name:response.name};
            return expense;
          });
      });
      const modifiedExpenses=await Promise.all(promise);
      let expSet=new Set();
      const final=modifiedExpenses.map(expense=>{
        if (!expSet.has(expense.name)) {
          expense.total = Number(expense.amount);
          expSet.add(expense.name);
        } else {
          const existingExpense = modifiedExpenses.find(exp => exp.name === expense.name);
          existingExpense.total += Number(expense.amount);
          return null;
        }
        return expense;
      });
      const FinalExpenses=await Promise.all(final);
      return res.status(200).json({ expenses:FinalExpenses.filter(expense=>expense!==null).sort((a,b)=>b.total-a.total) });
    })
    .catch(err=>{
      console.log(err)
    })
};
