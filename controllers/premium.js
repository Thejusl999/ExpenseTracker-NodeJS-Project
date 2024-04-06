const Razorpay = require("razorpay");
const Order = require("../models/Order");

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
