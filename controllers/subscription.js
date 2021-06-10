//jshint esversion:6
const model = require('../models/UserModel.js');

const url= "https://50gmk627db.execute-api.us-east-2.amazonaws.com/prod/payment/11111";

let subscriptionData;
// exports.subscriptionFetcher=(req,res,next)=>{
//   const phone=req.cookies.phone;
//
//   axios.get(url).then(resp => {
//       subscriptionData=resp.data;
//       console.log("Fetching");
//   })
//   .finally(()=>{
//     next();
//     });
// };
exports.subscription=(req,res)=>{
  const cookie=req.cookies;
  console.log(cookie);
  res.render("recharge",
  {name:cookie.username,
  end_date:model.end_date,
  start_date:model.start_date,
  phone:cookie.phone,
  carrier:model.carrier}
    );
};
