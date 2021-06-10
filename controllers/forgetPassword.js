//jshint esversion:6

const authService = require('../Services/SignUpService.js');
const functionFile=require('../data/dashboard_data.js');

exports.forgetPassword = function(req, res){
    res.render('forgetPassword',{name:null});
};

exports.postForgetPassword=(req,res)=>{
    authService.forgetPassword(req.body.email,(err, data)=>{
      if(err){
        res.send(err);
      }
      else if(data){
        res.cookie("tempEmail",req.body.email);
        res.redirect('/newPassword');
      }
    });
};
