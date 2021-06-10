//jshint esversion:8
const model = require('../models/UserModel.js');
const fetcher=require('../data/dashboard_data.js');
exports.leaderboard= (req,res)=>{
  const cookie=req.cookies;
  fetcher.fetchResult(async(err,data)=>{
    fetcher.fetchSingleUser(cookie.email,(async(errUser, respUser)=>{

    await data.Items.sort(custom_sort);
      if(err){

      }
      else if(data){
        res.render("leaderboards",
        {name:typeof(cookie.username) === 'undefined' ? null : cookie.username,
        data: data.Items,
        end_date:model.end_date,
        start_date:model.start_date,
        phone:cookie.phone,
        carrier:model.carrier,
        wallet_amount:respUser ? respUser.Item.wallet_amount.S:'-'
      });
      }
  }));
});
};

exports.postLeaderBoard=(req,res)=>{
    res.redirect('/leaderBoardChallenge?id='+req.body.id);
};

function custom_sort(a, b) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}