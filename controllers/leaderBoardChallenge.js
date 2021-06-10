//jshint esversion:8
const fetcher=require('../data/dashboard_data.js');
const model = require('../models/UserModel.js');

exports.leaderboardChallenge=(req,res)=>{
  const cookie=req.cookies;
  const id=req.query.id;
  fetcher.fetchUnitResult(id,(resultDataNew)=>{
  

    fetcher.fetchSingleUser(cookie.email,(errUser, respUser)=>{
        res.render("leaderBoardChallenge",
        {
        name:typeof(cookie.username) === 'undefined' ? null : cookie.username,        
        userEmail:typeof(cookie.email) === 'undefined' ? null : cookie.email,

        // userData:userData.data,
        userData:JSON.parse(resultDataNew.Item.resultData.S.replace("'","")),
        unitChallenge:JSON.parse(resultDataNew.Item.unitChallenge.S).Item,
        end_date:null,
        url:resultDataNew.Item.url.S,
        wallet_amount:respUser ? respUser.Item.wallet_amount.S:'-',
        createdAt:resultDataNew.Item.createdAt.S
      });
    }); 
  });
};