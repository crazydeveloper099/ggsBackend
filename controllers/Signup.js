//jshint esversion:6

const bodyParser = require("body-parser");
const validator = require("email-validator");
const functionFile = require("../data/dashboard_data.js");
require('dotenv').config();
require('cross-fetch/polyfill');
const authService = require('../Services/SignUpService');
const Amplitude = require('amplitude')
const amplitude = new Amplitude(process.env.amplitudeApiKey)

const logSignupSuccess=async(email)=>{
  const amplitudePayload = {event_type: 'NEW_USER_SIGNUP_UNCONFIRMED', user_id: email, }
  try {await amplitude.track(amplitudePayload)} 
  catch (err) {console.error(err)}
}

const logSignupError=async(email)=>{
  const amplitudePayload = {event_type: 'SIGNUP_ERROR', user_id: email}
  try {await amplitude.track(amplitudePayload)} 
  catch (err) {console.error(err)}
}


exports.register = (req, res)=>{
  functionFile.scanUserTable((err, data)=>{
    console.log((req.body.phone).trim());
   for (i=0;i<data.Items.length;i++){

     if((data.Items[i].phone)===(req.body.phone).trim()){
       res.send("NumberExistException");
       break;
     }
     else if(i==data.Items.length-1  ){

            authService.Register(req.body, async(err, result)=>{
              if(err){
                logSignupError(req.body.email)
                res.send(err);

              }
              else{
                logSignupSuccess(req.body.email)
                
                res.cookie('unConfirmedUsername', req.body.name,{ httpOnly: true,  overwrite: true});
                res.cookie('unConfirmedemail', req.body.email,{ httpOnly: true,  overwrite: true});
                res.cookie('unConfirmedphone', req.body.phone,{ httpOnly: true,  overwrite: true});
                res.send('success');       
              }
            });
          };
        }
   });
};