const path = require("path");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const secretKey = require("../util/secretKey");

exports.signupUser = async (req, res, next) => {
  const { name, email, password } = req.body;
  const newUser = { name, email, password };
  try {
    const hash = await bcrypt.hash(newUser.password, 10);
    await User.create({ ...newUser, password: hash });
    res.status(200).json({ success: true, newUser });
  } catch (err) {
    if (err.original.code === "ER_DUP_ENTRY") {
      res.status(403).json({ success: false, error: err.original.code });
    } else {
      res.status(500).json({ success: false, error: err });
    }
  }
};

exports.connectSignup = async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "html", "signup.html"));
};

function generateToken(id, name) {
  return jsonwebtoken.sign({ userId: id, username: name }, secretKey);
}

exports.loginUser = async (req, res, next) => {
  const { email, password } = req.body;
  const fetchedUser = { email, password };
  try {
    const user = await User.findAll({ where: { email: fetchedUser.email } });
    if (user.length > 0 && fetchedUser.email === user[0].email) {
      const result = await bcrypt.compare(
        fetchedUser.password,
        user[0].password
      );
      if (result) {
        return res.status(200).json({
          success: true,
          message: "User logged in successfully!",
          token: generateToken(user[0].id, user[0].name),
          isPremium: user[0].isPremium,
        });
      } else {
        return res.status(401).json({ success:false,error: "Incorrect password. Please try again!" });
      }
    } else {
      return res.status(404).json({ success:false,error: "User not found. Please try again!" });
    }
  } catch (err) {
    return res.status(500).json({ success:false,error: 'Internal server error' });
  }
};

exports.connectLogin = async (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "html", "login.html"));
};
