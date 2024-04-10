const Razorpay = require("razorpay");
const Order = require("../models/Order");
const Expense=require('../models/Expense');
const User=require('../models/User');
const sequelize = require("../util/database");

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
  // 1) Expense.findAll()                                    // bruteforce-optimized
  // 2) Expense.findAll({attributes:['userId','amount']})    // optimizing using attributes
  
  // 3) optimizing using sequelize.fn and adding column 'total'
  /* Expense.findAll({attributes:['userId',[sequelize.fn('sum',sequelize.col('amount')),'total']],group:['userId']})
    .then(async(expenses)=>{
      const promise=expenses.map(expense=>{
        return User.findByPk(expense.userId,{attributes:['id','name']})
          .then(response=>{
            expense={...expense.dataValues,name:response.name};
            return expense;
          });
      });
      const modifiedExpenses=await Promise.all(promise);
      
      // bruteforce-optimized (removed after optimizing using sequelize.fn and adding column 'total')
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
      const finalExpenses=await Promise.all(final);
      return res.status(200).json({ expenses:finalExpenses.filter(expense=>expense!==null).sort((a,b)=>b.total-a.total) });

      return res.status(200).json({ expenses:modifiedExpenses.filter(expense=>expense!==null).sort((a,b)=>b.total-a.total) });
    }) */

    // 4) using joins to join User Model and Expense Model
    User.findAll({
      attributes:['id','name',[sequelize.fn('sum',sequelize.col('amount')),'total']],
      include:[
        {
          model:Expense,
          attributes:[]
        }
      ],
      group:['user.id'],
      order:[['total','DESC']]
    })
    .then(response=>{
      return res.status(200).json(response);
    })
    .catch(err=>{
      console.log(err)
    })
};
