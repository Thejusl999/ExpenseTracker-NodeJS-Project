const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const {v4:UUIDV4} = require('uuid');

const ForgotPasswordReq = sequelize.define("forgotPasswordReq", {
  id: {
    type: Sequelize.UUID,
    defaultValue:()=>UUIDV4(),
    allowNull:false,
    primaryKey: true
  },
  userId:{
    type:Sequelize.INTEGER,
    allowNull:false
  },
  isActive:{
    type:Sequelize.BOOLEAN,
    allowNull:false,
    defaultValue:true
  }
});

module.exports=ForgotPasswordReq;