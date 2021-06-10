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
const moment = require('moment');
moment().format();

const Amplitude = require('amplitude')
const amplitude = new Amplitude(process.env.amplitudeApiKey)


let subscriptionData;
const subscriptionFetcher = (phone,res , callback) => {
  const url = process.env.fetch_userData+phone;
  axios.get(url).then(resp => {

      model.end_date = resp.data.end_date.S;
      model.start_date = resp.data.susc_date.S;
      model.carrier = resp.data.carrier.S;
      subscriptionData = resp.data;

      // res.cookie('subscriptionData', subscriptionData, { httpOnly: true,  overwrite: true});
    })
    .catch(error => {
    })
    .then(() => {
      callback();
    });
};

 
const logDashboardLoadedByUser=async()=>{
  const amplitudePayload = {event_type: 'DASHBOARD_VISITED', user_id: 'UNCONFIRMED_USER', }
  try {await amplitude.track(amplitudePayload)} 
  catch (err) {console.error(err)}
}

exports.dashboard = async(req, res) => {
  const cookie = req.cookies;
  const phone=cookie.phone;



data.dbChallengeFetcher(function(err, dataFetched) {

  
    // data.getCategory((errCategory,dataCategory)=>{
    if (err ) {
      res.send("Error Occured!")
    } else if (dataFetched) {
      subscriptionFetcher(phone,res, async()=>{
        const blockCheckMiddleware=()=>{
             functionFile.fetchSingleUser(req.cookies.email, (err, data)=>{
               if(err){ 
                 res.send(err);
              }
               else if(data){
                 res.redirect('/blockedUser');
               }
             });
        };
        await dataFetched.Items.sort(custom_sort);



        if(moment().isAfter(model.end_date) || typeof(cookie.username) === 'undefined' || model.end_date==='' ){
          logDashboardLoadedByUser()
          res.render('dashboard', {

            name: typeof(cookie.username) === 'undefined' ? null : cookie.username,
            data: dataFetched.Items,
            end_date: model.end_date,
            expired:true,
            tandc: typeof(cookie.tandc) === 'undefined' ? null : cookie.tandc,
            // dataCategory:dataCategory.Items
          });
        }
        else{
          res.redirect('/challengeList');
        }
      });
      }
    });
}

exports.postDashboard = (req, res) => {
  const id=req.body.id;
  if(id!==null && typeof(id) !== 'undefined' ){
    res.redirect('/challenge?id='+id);
  }
};

function custom_sort(a, b) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}