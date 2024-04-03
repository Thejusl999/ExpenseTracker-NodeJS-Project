const path=require('path');
const User=require('../models/User');

exports.addUser = async (req,res,next)=>{
    const newUser={
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };
    User.create(newUser)
        .then(result=>{
            res.status(200).json(newUser);
        })
        .catch(err=>console.log(err));
};

exports.connectFrontend = async(req, res) => {
    res.sendFile(path.join(__dirname,'..', 'public','html', 'signup.html'));
};