//jshint esversion:6

const authService = require('../Services/SignUpService.js');
const functionFile=require('../data/dashboard_data.js');

exports.getNewPassword = function(req, res){
    res.render('newPassword',{name:null});
};

exports.postNewPassword=(req,res)=>{
  const cookie = req.cookies;
  const email =cookie.tempEmail;
  console.log(req.body.code)
    authService.confirmPassword(email, req.body.code, req.body.password ,(err, data)=>{
      if(err){
        res.send("error");
      }
      else if(data){
        res.clearCookie('tempEmail');
        res.send("success");
      }
    });
};

exports.getNewCode=(req,res)=>{
  const email = req.cookies.tempEmail;
  authService.forgetPassword(email,(err, data)=>{
    
    if(err && err.code==='LimitExceededException') res.send('LIMIT_REACHED');
    else res.send('SUCC')
  });
}
