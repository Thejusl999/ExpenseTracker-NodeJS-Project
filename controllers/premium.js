const Razorpay = require("razorpay");
const Order = require("../models/Order");
const User = require("../models/User");
const Download = require("../models/Download");
const sequelize = require("../util/database");

// const AWS=require('aws-sdk');    // Moved to services folder
const UserServices = require("../services/userservices");
const S3Services = require("../services/s3services");

exports.buyPremium = async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.razorpayKey_id,
    key_secret: process.env.razorpayKey_secret,
  });

  try {
    const order = await razorpay.orders.create({
      amount: 2500,
      currency: "INR",
    });
    await req.user.createOrder({ orderId: order.id, status: "PENDING" });
    res.status(201).json({ order, key_id: razorpay.key_id });
  } catch (err) {
    res.status(500).json({ success: false, error: "Internal Server Error!" });
  }
};

exports.updateStatus = async (req, res) => {
  const transact = await sequelize.transaction();
  const { payment_id, order_id, status } = req.body;
  try {
    const order = await Order.findOne({
      where: { orderId: order_id },
      transaction: transact,
    });
    if (!status) {
      const updateOrder = order.update(
        {
          paymentID: payment_id,
          status: "SUCCESSFUL",
        },
        {
          transaction: transact,
        }
      );
      const updateUser = req.user.update(
        { isPremium: true },
        { transaction: transact }
      );
      await Promise.all([updateOrder, updateUser]);
      await transact.commit();
      return res
        .status(202)
        .json({ success: true, message: "Transaction Successful!" });
    } else {
      await order.update({ status: "FAILED" }, { transaction: transact });
      await transact.commit();
      return res.status(402).json({
        success: false,
        message: "Transaction Failed. Please retry!",
      });
    }
  } catch (err) {
    await transact.rollback();
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error!" });
  }
};

exports.showLeaderboard = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["name", "totalExpense"],
      order: [["totalExpense", "DESC"]],
    });
    return res.status(200).json({ success: true, response: users });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error!" });
  }
};

// Moved to services folder
/* function uploadToS3(data,filename){
  const BUCKET_NAME=process.env.BUCKET_NAME;
  const IAM_USER_KEY=process.env.IAM_USER_KEY;
  const IAM_USER_SECRET=process.env.IAM_USER_SECRET;

  let s3Bucket=new AWS.S3({
    accessKeyId:IAM_USER_KEY,
    secretAccessKey:IAM_USER_SECRET
  });

  var params={
    Bucket:BUCKET_NAME,
    Key:filename,
    Body:data,
    ACL:'public-read'
  };
  return new Promise((resolve,reject)=>{
    s3Bucket.upload(params,(err,s3response)=>{
      if(err){
        console.log('Something went wrong!',err);
        reject(err);
      }else{
        console.log('Success!',s3response);
        resolve(s3response.Location);
      }
    });
  })
} */

exports.downloadExpenses = async (req, res) => {
  try {
    // const expenses=await req.user.getExpenses();
    const expenses = await UserServices.getExpenses(req);
    const stringifiedExpenses = JSON.stringify(expenses);
    const userId = req.user.id;
    const filename = `Expenses${userId}/${new Date()}.text`;
    const fileURL = await S3Services.uploadToS3(stringifiedExpenses, filename);
    await Download.create({
      url: fileURL,
      filename: filename.split("/")[1].substring(4, 21),
      userId: req.user.id,
    });
    res.status(200).json({ fileURL, success: true });
  } catch (err) {
    res.status(500).json({ fileURL: "", success: false, err: err });
  }
};

exports.getDownloads = async (req, res) => {
  const {page,pageSize}=req.query;
  try {
    if(page){
      const response = await Download.findAll({
        where: { userId: req.user.id },
        offset: (page - 1)*Number(pageSize),
        limit:Number(pageSize)
      });
      return res.status(200).json({ success: true, response });
    }else{
      const response = await Download.findAll({where: { userId: req.user.id }});
      return res.status(200).json({ success: true, response });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error!" });
  }
};
