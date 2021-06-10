//jshint esversion:6
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const validator = require("email-validator");
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const axios = require('axios');
const data = require('../data/dashboard_data.js');
const model = require('../models/UserModel.js');
const Api = require('../Api/getCategories.js');
const dotenv = require('dotenv');
dotenv.config();
const moment = require('moment-timezone');
moment().toString();

let challengeData="";
exports.getManageScreen=(req,res)=>{
    const cookie = req.cookies;
    const isValidLogin = req.cookies.isValid;
    const eventType=req.cookies.activeEvent
    if (isValidLogin) {
      unitChallenge = cookie.manageChallenge;
      data.fetchVideoPresetsData((errFetching, videoPresetsData) => {
        data.fetchSingleChallenge(unitChallenge,eventType,(err, userData) => {   
          if (userData) {
            global.challengeData=userData.Item;  
            console.log(userData.Item);
              res.render('manageChallenge', {
                name: typeof(cookie.adminUser) === 'undefined' ? null : cookie.adminUser,
                unitChallenge: userData.Item,
                userDataNew: userData,
                end_date: null,
                isPasswordPublished:userData.Item.passwordTimer.S!='null'?true:false,
                videoPresetsData,
                eventType
            });
          } else res.send(err);
        });
      });
  } else res.redirect('/admin');    
}

exports.postManage=(req,res)=>{
  const challengeID = req.cookies.manageChallenge;
  let postData=JSON.parse(req.body.jsonData);
  const eventType=req.cookies.activeEvent
  data.fetchSingleChallenge(challengeID,eventType, (err, userData) => {   
    let challengeData=userData.Item; 
    let tokenArr=[];
  let action="DETAILS_UPDATED"
  challengeData.challengeName.S=postData[0];
  challengeData.challengeTime.S=postData[1];
  challengeData.end_time.S=postData[1];
  challengeData.challengeDescription.S=postData[2];
  challengeData.spots.S=postData[3];
  challengeData.challengeRules.S=postData[4];
  challengeData.challengePrize=postData[5];
  
  if(postData[6].length>0){
    challengeData.password=JSON.stringify(postData[6])
    let d1 = postData[10];
    challengeData.passwordTimer=String(d1);
    if("usersData" in challengeData){
      for(i=0;i<JSON.parse(challengeData.usersData.S).length;i++){
        if(JSON.parse(challengeData.usersData.S)[i].fcmToken!=='null'){
          tokenArr.push(JSON.parse(challengeData.usersData.S)[i].fcmToken);
        }
      }
    }
    action="PASSWORD_ANNOUNCED"
  }
  else if(challengeData.passwordTimer.S=='null'){
      challengeData.password='[]';
      challengeData.passwordTimer='null';
  }
  else{
    challengeData.passwordTimer=challengeData.passwordTimer.S
    challengeData.password=challengeData.password.S
  }
  if(postData[9]==true && postData[8]!=null){
    action="MATCH_ENDED"
    challengeData.resultTimer={S:postData[8]};
    challengeData.isMatchEnded={S:'true'}
  }
 
  if(postData[7]!=='Choose'){ challengeData.ytLinkLobbyTutorial={S:postData[7]}}

  data.updateChallenge( challengeData,tokenArr,action,eventType,(err,resp)=>{
    if(resp){
        res.cookie('updatedChallenge', true, {
            httpOnly: true
        });
      res.redirect('/adminPanel');
    }    
   }); 
  }); 
}