const path = require("path");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jsonwebtoken=require("jsonwebtoken");
const secretKey=require("../util/secretKey");

exports.signupUser = async (req, res, next) => {
  const newUser = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };
  bcrypt.hash(newUser.password, 10, (err, hash) => {
    if (!err) {
      User.create({ ...newUser, password: hash })
        .then((result) => {
          res.status(200).json(newUser);
        })
        .catch((err) => {
          if (err.original.code === "ER_DUP_ENTRY") {
            res.status(403).json({ error: err.original.code });
          }
        });
    }
  });
};

exports.connectSignup = async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "html", "signup.html"));
};


function generateToken(id,name){
  return jsonwebtoken.sign({userId:id,username:name},secretKey);
}

exports.loginUser = async (req, res, next) => {
  const fetchedUser = {
    email: req.body.email,
    password: req.body.password,
  };
  User.findAll({ where: { email: fetchedUser.email } })
    .then((user) => {
      if (user.length > 0) {
        if (fetchedUser.email === user[0].email) {
          bcrypt.compare(
            fetchedUser.password,
            user[0].password,
            (err, result) => {
              if (err) {
                return res.status(500).json({ error: 'Internal server error' });
              }
              if (result === true) {
                return res
                  .status(200)
                  .json({ message: "User logged in successfully!",token:generateToken(user[0].id,user[0].name),isPremium:user[0].isPremium});
              } else {
                return res
                  .status(401)
                  .json({ error: "Incorrect password. Please try again!" });
              }
            }
          );
        }
      } else {
        return res
          .status(404)
          .json({ error: "User not found. Please try again!" });
      }
    })
    .catch((err) => {
        return res.status(500).json({ error: 'Internal server error' });
    });
};

exports.connectLogin = async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "html", "login.html"));
};
