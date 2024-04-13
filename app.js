require('dotenv').config();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const sequelize=require('./util/database');
const User=require('./models/User');
const Expense=require('./models/Expense');
const Order=require('./models/Order');
const ForgotPasswordReq=require('./models/ForgotPasswordReq');

const app = express();
app.use(cors());
app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const userRoutes=require('./routes/users');
const expenseRoutes=require('./routes/expenses');
const premiumRoutes=require('./routes/premium');

app.use(userRoutes);
app.use(expenseRoutes);
app.use(premiumRoutes);

User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPasswordReq);
ForgotPasswordReq.belongsTo(User);

sequelize
    .sync()
    .then(result=>{
        app.listen(3000);
    })
    .catch(err=>console.log(err));