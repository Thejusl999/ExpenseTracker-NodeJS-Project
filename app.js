const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const sequelize=require('./util/database');

const app = express();
app.use(bodyParser.json({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const routes=require('./routes/users');
app.use(routes);

sequelize
    .sync()
    .then(result=>{
        app.listen(3000);
    })
    .catch(err=>console.log(err));