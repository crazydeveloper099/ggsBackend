//jshint esversion:6
const data = require('../data/dashboard_data.js');
const path = require('path');
const multer = require('multer');
const rootPath=require('../app.js');
let challengeName;
const fs = require('fs');
const uploadFile= require('../data/upload_file.js');
const fb=require('./firebase_admin.js');

let unitChallenge;

exports.renderPayoutWinners = (req, res) => {

  const cookie = req.cookies;
  const isValidLogin = req.cookies.isValid;
  
  if (isValidLogin) {
    data.getWithdrawalRequests((WithdrawalReqArr)=>{
      console.log(WithdrawalReqArr);
      res.render('payOutWinners', {
        name: typeof(cookie.adminUser) === 'undefined' ? null : cookie.adminUser,
        userData: WithdrawalReqArr,
        unitChallenge: null,
        end_date: null
    })
  })    
         
     
  } else res.redirect('/admin');
};


exports.changeStatusOfWithdrawal = (req, res) => {
  let emailTxnIdArr=JSON.parse(req.body.jsonData);
  let idArr=emailTxnIdArr.map((emailTxnId)=> {return emailTxnId.split(',')[0]})
  let emailArr=emailTxnIdArr.map((emailTxnId)=>{return {"email":emailTxnId.split(',')[1],
                                                        "txnID":emailTxnId.split(',')[0],
                                                        "amt":emailTxnId.split(',')[2]}})
  
   data.updateMultipleWithdrawalReq(idArr,emailArr,(err)=>{
    if(err){
      res.send('error occured');
    }
    else{
      res.redirect('/adminPanel');
    }
  })
};


