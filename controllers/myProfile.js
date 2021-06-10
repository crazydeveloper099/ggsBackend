//jshint esversion:8
const fetcher = require('../data/dashboard_data.js');
const model = require('../models/UserModel.js');
const dotenv = require('dotenv');
const axios = require('axios');
const moment = require('moment');
moment().format();
dotenv.config();
let subscriptionData=null;
  let challengesArray=[];
exports.getMyProfile = (req, res) => {
  const cookie = req.cookies;
  const id = cookie.leaderBoardChallengeClickedID;
  const phone = cookie.phone;
  subscriptionFetcher(phone, () => {
    fetcher.fetchSingleUser(cookie.email,(err,data)=>{
      if(err){
        res.send("Error Occured!");
      }
      else{
      let userChallenges=null;  
      let userWonChallenges=null;
      if(data.Item.challenges){
          userChallenges=JSON.parse(data.Item.challenges.S)
      }
      if(data.Item.challengesWon){
          userWonChallenges=JSON.parse(data.Item.challengesWon.S);
      }
    if(moment().isAfter(model.end_date)){
      res.render("myProfile", {
        name: typeof(cookie.username) === 'undefined' ? null : cookie.username,
        email: cookie.email,
        challengesParticipated:userChallenges,
        challengesWon:userWonChallenges ,
        start_date: subscriptionData.susc_date.S,
        phone: phone,
        carrier: cookie.carrier,
        active:false,
        end_date: subscriptionData.end_date.S,
        wallet_amount:respUser ? respUser.Item.wallet_amount.S:'-'
        
      });
    }
    else{
      if(subscriptionData==null){
        res.render("myProfile", {
          name: typeof(cookie.username) === 'undefined' ? null : cookie.username,
          email: cookie.email,
          challengesParticipated:userChallenges,
          challengesWon: userWonChallenges,
          start_date: null,
          phone: phone,
          carrier: cookie.carrier,
          active:false,
          end_date: null,
          wallet_amount:data.Item.wallet_amount.S

        });
      }
      else{
        res.render("myProfile", {
          name: typeof(cookie.username) === 'undefined' ? null : cookie.username,
          email: cookie.email,
          challengesParticipated:userChallenges,
          challengesWon: userWonChallenges,
          start_date: subscriptionData.susc_date.S,
          phone: phone,
          carrier: cookie.carrier,
          active:true,
          end_date: subscriptionData.end_date.S,
          wallet_amount:data.Item.wallet_amount.S

        });
      }
      
    } 
   }  
   });    
  });
};

function callback_Original(challengeData, userData) {
  return new Promise((resolve, reject) => {
    challengesArray = challengeData.data.data.filter(function(e, index) {
      console.log(userData.data.competition_id.includes(e.competition_id) +"==="+ e.competition_id);
      return userData.data.competition_id.includes(e.competition_id);
    });
    resolve();
  });
}

const subscriptionFetcher = (phone, callback) => {
  const url = process.env.fetch_userData + phone;
  console.log(url);

  axios.get(url).then(resp => {
if(resp.data===""){
    callback();
}
else{
      model.end_date = resp.data.end_date.S;
      model.start_date = resp.data.susc_date.S;
      model.carrier = resp.data.carrier.S;
      subscriptionData = resp.data;
      callback();
}
})
    .catch(error => {
      console.log(error);
    });
};
