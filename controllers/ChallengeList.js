//jshint esversion:6

const data = require("../data/dashboard_data.js");
const model = require("../models/UserModel.js");

exports.getChallengeList =  (req, res) => {
  const cookie = req.cookies;
  const phone = cookie.phone;
  const subscription_data = cookie.subscriptionData;
  data.dbChallengeFetcher(function (err, dataFetched) {
    data.getCategory((errCategory, dataCategory) => {
      data.getPosterData((errPoster, dataPoster) => {
        data.fetchSingleUser(cookie.email,(async(errUser, respUser)=>{
        
        if (err || errCategory || errPoster) {
          res.send("error");
        } else if (dataFetched && dataCategory) {
        
          await dataFetched.Items.sort(custom_sort);
          res.render("ChallengeList", {
            name:
              typeof cookie.username === "undefined" ? null : cookie.username,
              data: dataFetched.Items,
              end_date: model.end_date,
              tandc: typeof cookie.tandc === "undefined" ? null : cookie.tandc,
              dataCategory: dataCategory.Items,
              dataPoster: dataPoster.Items,
              wallet_amount:respUser ? respUser.Item.wallet_amount.S:'-'
          });
        }
       }));
      });
    });
  });
};

function custom_sort(a, b) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}
exports.getResultStatus=(req,res) =>{
  data.fetchResult((err, resultData)=> {
    res.send(resultData);
  });
}