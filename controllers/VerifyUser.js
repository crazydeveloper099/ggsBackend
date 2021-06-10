//jshint esversion:6
const authService = require('../Services/SignUpService');
const functionFile=require('../data/dashboard_data.js');
const fb=require('./firebase_admin.js');
const dotenv = require('dotenv').config();
const Amplitude = require('amplitude')
const amplitude = new Amplitude(process.env.amplitudeApiKey)

exports.getVerifyUser = function(req, res){
    res.render('verifyUser',{name:null});
};

exports.resendCode= (req,res)=>{
  const cookie = req.cookies;
  const email =cookie.unConfirmedemail;
   authService.verifyUserFunction(email,null,true, (err, result)=>{
     res.render('verifyUser',{name:null});
   });
};

const logNewUserSignupConfirmed=async(email)=>{
  const amplitudePayload = {
    event_type: 'NEW_USER_EMAIL_VERIFIED', 
    user_id: email, 
  }
  try {await amplitude.track(amplitudePayload)} catch (err) {console.error(err)}
}

const logVerifyUserError=async(email)=>{
  const amplitudePayload = {
    event_type: 'VERIFY_USER_ERROR', 
    user_id: email, 
  }
  try {await amplitude.track(amplitudePayload)} catch (err) {console.error(err)}
}



exports.postVerifyUser = function(req, res){
  const cookie = req.cookies;
  const email =cookie.unConfirmedemail;
  const verificationCode=req.body.verificationCode;
  console.log();
    let register = authService.verifyUserFunction(email,verificationCode,false, function(err, result){
    if(err){
        console.log(err);
        res.send(err);
        return;
      }
    else{

     
     if(typeof(req.body.token) !== 'undefined'){
      fb.subscribe(req.body.token, "all", (err1,data1)=>{
        if(err1){
          logVerifyUserError(cookie.unConfirmedemail)
        }
        else{
        functionFile.writeUser(cookie.unConfirmedemail, cookie.unConfirmedUsername, cookie.unConfirmedphone,false,req.body.token,async(errVer,dataVer)=>{
          logNewUserSignupConfirmed(cookie.unConfirmedemail)

          if(errVer){
             res.send("Error");
          }
          res.cookie('username', cookie.unConfirmedUsername,{ httpOnly: true,  overwrite: true});
          res.cookie('email', cookie.unConfirmedemail,{ httpOnly: true,  overwrite: true});
          res.cookie('phone', cookie.unConfirmedphone,{ httpOnly: true,  overwrite: true});
          res.clearCookie('unConfirmedUsername');
          res.clearCookie('unConfirmedemail');
          res.clearCookie('unConfirmedphone');
          res.send("success");
          });
        }
      });
     }
     else{
      functionFile.writeUser(cookie.unConfirmedemail, cookie.unConfirmedUsername, cookie.unConfirmedphone,false,"",(errVer,dataVer)=>{
        if(errVer){
          res.send("Error");
        }
        res.cookie('username', cookie.unConfirmedUsername,{ httpOnly: true,  overwrite: true});
        res.cookie('email', cookie.unConfirmedemail,{ httpOnly: true,  overwrite: true});
        res.cookie('phone', cookie.unConfirmedphone,{ httpOnly: true,  overwrite: true});
        res.clearCookie('unConfirmedUsername');
        res.clearCookie('unConfirmedemail');
        res.clearCookie('unConfirmedphone');
        res.send("success");
        });
     }
    }
  });
};
