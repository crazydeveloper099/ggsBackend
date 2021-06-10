//jshint esversion:6
const axios = require('axios');

const authService = require('../Services/LoginService.js');

exports.loginModal=(req,res)=>{
  const url='?api_key=f6ee1fe5ab4f1b21b47b3963f8b75052';
  // axios({
  //   method: 'post',
  //   url: 'https://sweepwidget.com/sw_api/white-list-emails.php',
  //   data: {
  //     api_key:"f6ee1fe5ab4f1b21b47b3963f8b75052",
  //     global: 0,
  //     competition_id :'20093-6v9zlbxa',
  //     whitelisted_emails:['one@sweepwidget.com', 'two@sweepwidget.com', 'three@sweepwidget.com']
  //   }
  // })
  // .then(function (response) {
  //   console.log(response);
  // })
  // .catch(function (error) {
  //   console.log(error);
  // });
  res.render('admin_modal',{name:null});
};

exports.postAdmin=(req,res)=>{
  const data={
    username: req.body.username,
    password: req.body.password
  };
  authService.Login(data,function(err,result){
    if(err){
      res.send("Invalid Credentials");
    }
    else{
    console.log( result);
    res.cookie('adminUser', req.body.username, { httpOnly: true });
    res.cookie('isValid', true, { httpOnly: true });
    res.redirect('/adminPanel');
    }
  }, false);
  
};
