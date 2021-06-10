//jshint esversion:8
const bodyParser = require("body-parser");
const validator = require("email-validator");
const request = require('request');
const util = require('util');
const dotenv = require('dotenv');
dotenv.config();

require('cross-fetch/polyfill');

const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

exports.Login = function (body, callback, user) {
let poolData=null;
if(user){
   console.log("this working  Usert");
    poolData = {
       UserPoolId: process.env.UserPoolId,
       ClientId:  process.env.ClientId
    };
  }
  else{
     console.log("this working");
  poolData = {
     UserPoolId: process.env.AdminPoolId,
     ClientId: process.env.AdminClientId
  };
}
const pool_region = "us-east-2";
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
   const userName = body.username;
   const password = body.password;
   const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: userName,
        Password: password
    });
   const userData = {
        Username: userName,
        Pool: userPool
    };
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
           console.log("yes");
           console.log(result);
           callback(false,result);
        },
        onFailure: (function (err) {
         console.log("no");
         console.log(err);
          callback(err,false);
       })
   });
};
