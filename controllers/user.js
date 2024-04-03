const path=require('path');
const User=require('../models/User');

exports.signupUser = async (req,res,next)=>{
    const newUser={
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };
    User.create(newUser)
        .then(result=>{
            res.status(200).json(newUser);
        })
        .catch(err=>{
           if(err.original.code==='ER_DUP_ENTRY'){
            res.status(403).json({error:err.original.code});
           }
        });
};

exports.connectSignup = async(req, res) => {
    res.sendFile(path.join(__dirname,'..', 'public','html', 'signup.html'));
};

exports.loginUser = async (req,res,next)=>{
    const fetchedUser={
        email: req.body.email,
        password: req.body.password
    };
    User.findAll({where:{email:fetchedUser.email}})
        .then(user=>{
            if(user.length>0){
                if(fetchedUser.email===user[0].email){
                    if(fetchedUser.password===user[0].password){
                        res.status(200).json({response:'User logged in successfully!'});
                    }else{
                        res.status(401).json({error:'Incorrect password. Please try again!'});
                    }
                }
            }else{
                throw new Error();
            }
        })
        .catch(err=>{
            res.status(404).json({error:'User not found. Please try again!'});
        });
};

exports.connectLogin = async(req, res) => {
    res.sendFile(path.join(__dirname,'..', 'public','html', 'login.html'));
};