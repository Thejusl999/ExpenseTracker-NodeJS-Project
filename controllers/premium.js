const Razorpay = require("razorpay");
const Order = require("../models/Order");
const User=require('../models/User');
const sequelize = require("../util/database");

exports.buyPremium = async(req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.razorpayKey_id,
    key_secret: process.env.razorpayKey_secret,
  });

  try{
    const order=await razorpay.orders.create({ amount: 2500, currency: "INR" });
    await req.user.createOrder({ orderId: order.id, status: "PENDING" });
    res.status(201).json({ order, key_id: razorpay.key_id });
  }catch(err){
    res
      .status(500)
      .json({ success: false, error: "Internal Server Error!" });
  }
};

exports.updateStatus = async (req, res) => {
  const transact=await sequelize.transaction();
  const { payment_id, order_id, status } = req.body;
  try{
    const order=await Order.findOne({ where: { orderId: order_id } , transaction:transact });
    if(!status){
      const updateOrder = order.update({
        paymentID: payment_id,
        status: "SUCCESSFUL",
      },{
        transaction:transact
      });
      const updateUser = req.user.update({ isPremium: true },{transaction:transact});
      await Promise.all([updateOrder, updateUser]);
      await transact.commit();
      return res
        .status(202)
        .json({ success: true, message: "Transaction Successful!" });
    }else {
      await order.update({ status: "FAILED" },{transaction:transact});
      await transact.commit();
      return res
        .status(402)
        .json({
          success: false,
          message: "Transaction Failed. Please retry!",
        });
    }
  }catch(err){
    await transact.rollback();
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error!" });
  }
}; 

exports.showLeaderboard=async(req,res)=>{
  try{
    const users=await User.findAll({
      attributes:['name','totalExpense'],
      order:[['totalExpense','DESC']]
    });
    return res.status(200).json({success:true,response:users});
  }catch(err){
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error!" });
  }
};
