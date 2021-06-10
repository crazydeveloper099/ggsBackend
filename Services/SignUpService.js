//jshint esversion:6

const bodyParser = require("body-parser");
const validator = require("email-validator");
const dotenv = require('dotenv');
dotenv.config();
const AWS = require('aws-sdk');
require('amazon-cognito-js');
require('cross-fetch/polyfill');

global.navigator = () => null;
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const poolData = {
  UserPoolId: process.env.UserPoolId,
  ClientId:  process.env.ClientId
};
const pool_region = "us-east-2";
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

AWS.config.region = 'us-east-2';

AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId:  process.env.UserPoolId,
});

exports.Register = function (body, callback) {
  const name=body.name;
   const email = body.email;
   const password = body.password;
   const attributeList = [];

   attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "name", Value: name }));
   attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({ Name: "email", Value: email }));

   userPool.signUp(email, password, attributeList, null, function (err, result) {
     if (err){
       console.log(err);
       callback(err,null);
       return;
     }
     else{
      const cognitoUser = result.user;
     console.log(cognitoUser);
     callback(null, cognitoUser);
     return;
     }
   });
};

 exports.verifyUserFunction=(email,code,resend,callback)=>{
    const poolData = {
        UserPoolId:  process.env.UserPoolId,
        ClientId: process.env.ClientId,
    };

    const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    const userData = {
        Username: email,
        Pool: userPool
    };
    let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    if(!resend){
    cognitoUser.confirmRegistration(code, true, function(err, result) {
    callback(err,result);
    });
    }
    else if(resend){

      cognitoUser.resendConfirmationCode(function(err, result) {
        callback(err,result);
    });
    }
};

exports.forgetPassword=(email, callback)=>{
  const poolData = {
      UserPoolId:  process.env.UserPoolId,
      ClientId: process.env.ClientId,
  };

  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const userData = {
      Username: email,
      Pool: userPool
  };
  let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.forgotPassword({
    onSuccess: function(data) {
        console.log(data);
        callback(null,data);
    },
    onFailure: function(err) {
      console.log( err);
      callback(err,null);
    },
    inputVerificationCode: function(data) {
      console.log(data);
        callback(null,data);        
    },
});
};

exports.confirmPassword=(email, verificationCode, newPassword, callback)=> {
  const poolData = {
      UserPoolId:  process.env.UserPoolId,
      ClientId: process.env.ClientId,
  };

  const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
  const userData = {
      Username: email,
      Pool: userPool
  };
  let cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.confirmPassword(verificationCode, newPassword, {
            onFailure(err) {
                callback(err,false);
            },
            onSuccess() {
                callback(null,true);
            },
        });
};
