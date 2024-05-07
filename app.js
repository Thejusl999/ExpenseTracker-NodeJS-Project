require("dotenv").config();
const path = require("path");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// const helmet = require("helmet");
// const compression = require("compression");
// const morgan = require("morgan");

const sequelize = require("./util/database");
const User = require("./models/User");
const Expense = require("./models/Expense");
const Order = require("./models/Order");
const ForgotPasswordReq = require("./models/ForgotPasswordReq");
const Download = require("./models/Download");

/* const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
); */

const app = express();
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: [
//         "'self'",
//         "'unsafe-inline'",
//         "https://cdnjs.cloudflare.com/ajax/libs/axios/1.6.8/axios.min.js",
//         "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",
//         "https://checkout.razorpay.com/v1/checkout.js",
//       ],
//       styleSrc: [
//         "'self'",
//         "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
//         "'unsafe-inline'",
//         "'unsafe-hashes'",
//       ],
//       frameSrc: ["'self'", "https://api.razorpay.com/"],
//     },
//   })
// );
// app.use(compression());
// app.use(morgan("combined", { stream: accessLogStream }));
app.use(cors());
app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

const userRoutes = require("./routes/users");
const expenseRoutes = require("./routes/expenses");
const premiumRoutes = require("./routes/premium");

app.use("/user", userRoutes);
app.use("/expenses", expenseRoutes);
app.use("/premium", premiumRoutes);

app.use((req,res)=>{
  res.sendFile(path.join(__dirname,`public/${req.url}`));
})

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPasswordReq);
ForgotPasswordReq.belongsTo(User);

User.hasMany(Download);
Download.belongsTo(User);

sequelize
  .sync()
  .then((result) => {
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));
