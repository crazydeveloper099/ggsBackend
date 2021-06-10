//jshint esversion:8
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const axios = require('axios');dotenv.config();
const { split } = require("lodash");
const nodemailer = require('nodemailer');
const moment_tz = require('moment-timezone');
moment_tz().toString();



const firebaseFile=require('../controllers/firebase_admin');

//mongoDB
const  mongoose  = require("mongoose");
mongoose.Promise  = require("bluebird");
const  url  =  process.env.mongoURL;
const mongoEventURL= process.env.mongoURLEvents;

// const connectEvent = mongoose.connect(
//                       mongoEventURL, 
//                       { useNewUrlParser: true  
//                       });


const Schema = mongoose.Schema;


const eventSchema = new Schema({
challengeId:{type: Object},src:{type: Object},end_time:{type: Object},
challengeTime:{type: Object},challengeDescription:{type: Object},
challengeRules:{type: Object},challengeName:{type: Object},
challengePrize:{type: Object},challengeType:{type: Object},
spots:{type: Object},minLevel:{type: Object},
isResultPublished:{type: Object},password:{type: Object},
passwordTimer:{type: Object},createdAt:{type: Object},
ytLinkParticipationInfo:{type: Object},ytLinkLobbyTutorial:{type: Object},
resultTimer:{type: Object},isMatchEnded:{type: Object},
eventType:{type: Object},liveStreamWidgetType:{type: Object},
livestreamUrl:{type: Object},battlefyLink:{type: Object},
users:{type: Object}, userImg:{type: Object},usersData:{type: Object},
},{timestamps: true});




  const getEnv=(TableName)=>{
    switch(process.env.NODE_ENV){
      case 'development':
          return TableName+'_dev';
  
      case 'production':
          return TableName;
  
      default:
          return TableName+'_dev';
    }
  }

  exports.checkUserExists=async(email)=>{
        const params = {
          TableName: getEnv('users'),
            Key:{
                email
            },
            AttributesToGet: [
               'email'
            ]
        }
        var exists = false
        let result = await docClient.get(params).promise();
        if (result.Item !== undefined && result.Item !== null) {
          exists = true
        }
        return (exists)
  }

  exports.checkUserExistsWithPhone=async(phone)=>{
        const params = {
          TableName: getEnv('users'),
            Key:{
                phone
            },
            AttributesToGet: [
               'phone'
            ]
        }
  
        var exists = false
        let result = await docClient.get(params).promise();
        if (result.Item !== undefined && result.Item !== null) {
          exists = true
        }
        return (exists)
  }
 
 
exports.createEvent=(
  id, image, end_time, description, rules, 
  challengeName, prize, type, spots, 
  minLevel, createdAt,ytLinkParticipationInfo,eventType,
  liveStreamWidgetType,livestreamUrl,BattlefyLink,
  callback) => {

    if(eventType!=null){
      const Event = mongoose.model(getEnv(eventType), eventSchema);
      connectEvent.then(db=>{
        new Event({
            challengeId: id,src: image,end_time,challengeTime:end_time,
            challengeDescription: description,challengeRules: rules,challengeName,
            challengePrize: prize,challengeType: type,spots: "0/"+spots,
            minLevel,isResultPublished:false,password:'null',
            passwordTimer:'null',createdAt,ytLinkParticipationInfo,
            ytLinkLobbyTutorial:'null',resultTimer:'null',isMatchEnded:'null',
            eventType,liveStreamWidgetType,livestreamUrl,
            battlefyLink:BattlefyLink,
            users:[],userImg:[],usersData:[]
        }).save((err, doc)=>{
          callback(err, doc);
        })
      })
    }
    else{
      callback('Not valid event', null);
    }
};

exports.dbChallengeFetcher = (eventType, callback) => {
    const Event = mongoose.model(getEnv(eventType), eventSchema);
    connectEvent.then(db=>{
        Event.find().then((challenge)=>{
            callback(challenges, err)
})})}

exports.fetchSingleChallenge = (id, eventType ,callback) => {
    const Event = mongoose.model(getEnv(eventType), eventSchema);
    connectEvent.then(db=>{
        Event.find({challengeId:id}).then((challenge)=>{
            callback(null, challenge)}
            ).catch(err=>callback(err, null))
        })}

exports.checkParticipation=(eventType, challengeId,email,userName,callback)=>{
    const Event = mongoose.model(getEnv(eventType), eventSchema);
    connectEvent.then(db=>{
        Event.find({challengeId}).then((challenge,err)=>{
            if(err){
                return callback(err,null)
            }
            else{
                if("users" in challenge && 
                "userImg" in challenge && 
                challenge.users.length>0 && 
                challenge.userImg.length>0){
                    if(challenge.users.includes(email) || 
                    challenge.userImg.findIndex(item => userName.toLowerCase() === 
                    item.trim().toLowerCase())!=-1)
                    {
                        return callback(true,challenge.spots)
                    }
                    else{
                        return callback(false,challenge.spots)
                    }
                }
                else return callback(false,challenge.spots);
}})})}


exports.participate=(email,id,url,score,userData,eventType,callback)=>{
    console.log(email,id,eventType);
  const Event = mongoose.model(getEnv(eventType), eventSchema);
    connectEvent.then(async db=>{

        let obj = await Event.findOne({challengeId:id});
        obj.users.push(email);
        obj.userImg.push({"email":email, "url":url, "score":score})
        obj.usersData.push(JSON.parse(userData))
        obj.spots=String(parseInt(obj.spots.split('/')[0])+1)
                                +
                                "/"+obj.spots.split('/')[1];
        obj.markModified('users');
        obj.markModified('userImg');
        obj.markModified('usersData');
                
        await obj.save(err=>{
            if(err)callback(err, null, null);
            else callback(null, 'saved', obj);
        });
    })
}



exports.createResult = (id, resultData, unitChallenge, url,callback) => {
  let createdAt=new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
  const params = {
    TableName: getEnv('results'),
    Item: {
      "challengeId": id,
      "url":url,
      "resultData": resultData,
      "unitChallenge": unitChallenge,
      createdAt
    }
  };
  
  docClient.put(params, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, data);
    } else {
      console.log(data);
      callback(err, data);
    }
  });
};

exports.fetchResult = (callback) => {
  const params = {
    TableName: getEnv('results'),
    ProjectionExpression: "challengeId, resultData, unitChallenge, createdAt"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
}

exports.dbChallengeFetcher = (callback) => {
  const params = {
    TableName: getEnv("challenges"),
    ProjectionExpression: "challengeId, challengeName, challengePrize,challengeType,challengeTime, src, challengeDescription, challengeRules,isResultPublished, spots, minLevel, createdAt,ytLinkParticipationInfo,ytLinkLobbyTutorial,resultTimer,isMatchEnded,passwordTimer,challengeBase"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};

exports.challengeFetcher = (callback) =>{
  const params = {
    TableName: getEnv("challenges"),
    ProjectionExpression: "challengeId, category, challengeDescription, challengeName, challengePrize, challengeRules, src, challengeType, end_time, start_time,isResultPublished,  createdAt,ytLinkParticipationInfo,ytLinkLobbyTutorial,resultTimer,isMatchEnded,passwordTimer,challengeBase"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, null);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(null, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};

exports.deleteChallenge = (tableName, challengeId, callback) => {
  var fileItem = {
    Key: {
      challengeId: challengeId,
    },
    TableName: getEnv(tableName),
  };

  docClient.delete(fileItem, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, data);
    } else {
      console.log(data);
      callback(err, data);
    }
  });
};

exports.getUsers = (id, callback) => {
  axios.get(url).then(resp => {
      callback(resp.data, null);
    })
    .catch(error => {
      callback(null, error);
      console.log(null, error);
    }).then(() => {
  });
};

exports.fetchUnitResult = (id, callback) => {
  var params = {
    Key: {
      "challengeId": {
        S: id
      },
    },
    TableName: getEnv('results')
  };
  var paramsUnitChallenge = {
    Key: {
      "challengeId": {
        S: id
      },
    },
    TableName: getEnv('challenges')
  };
  db.getItem(params, function(errResult, dataResult) {
    if (dataResult) {
      callback(null,dataResult);
    }
    else{callback(errResult,null);}
  });
};






exports.createCategory = (categoryName, callback) => {
  const params = {
    TableName: getEnv('Categories'),
    Item: {
      "categoryId": categoryName
    }
  };
  docClient.put(params, function(err, data) {
    if (err) {
      callback(err, data);
    } else {
      callback(err, data);
    }
  });
};


// const createCategoryTable=(tableName,callback)=>{
//   var params = {
//      TableName : tableName,
//      KeySchema: [
//      { AttributeName: "challengeId", KeyType: "HASH"}
//  ],
//  AttributeDefinitions: [
//      { AttributeName: "challengeId", AttributeType: "S" }
//  ],
//  ProvisionedThroughput: {
//      ReadCapacityUnits: 5,
//      WriteCapacityUnits: 5
// }
// };
// db.createTable(params, (err,data)=>{
//   callback(err,data);
// });
// };

exports.getCategory = (callback) => {
  const params = {
    TableName: getEnv("Categories"),
    ProjectionExpression: "categoryId"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};

exports.fetchCategoriesData = (table, callback) => {
  const params = {
    TableName: getEnv(table),
    ProjectionExpression: "challengeId, challengeName, challengePrize,challengeType,challengeTime, src, challengeCode, challengeDescription, challengeRules"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};

exports.fetchUserChallenges = (email, callback) => {
  let arr = [];
  const urlChallenges = "https://sweepwidget.com/sw_api/giveaways.php?api_key=" + process.env.SWEEP_API_KEY + "&type=expired&page_start=1";
  const urlUserChallenges = "https://sweepwidget.com/sw_api/user-entered-giveaways?api_key=" + process.env.SWEEP_API_KEY + "&user_email=" + "dcdv@dd.com" + "&search_key=user_email";
  axios.get(urlChallenges).then(challengeData => {
      axios.get(urlUserChallenges).then(userData => {
          callback(userData, challengeData, null);
        })
        .catch(error => {
          callback(null, null, error);
        });
    })
    .catch(error => {
      callback(null, null, error);
    });

};


exports.scanSubscriptionTable = (callback) => {
  const params = {
    TableName: getEnv('claroTable'),
    ProjectionExpression: "msisdn, carrier, end_date, service, susc_date"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};

exports.createUser = async(email, name, phone, isBlocked,token,picture,authType) => {  
  const params = {
    TableName: getEnv('users'),
    Item: {
      "email": email,
      "isBlocked": isBlocked,
      "fcmToken":token,
      "phone":phone,
      "name":name,
      "wallet_amount":'0',
      "total_participated":'0',
      "total_challenges_won":'0',
      picture,
      authType
    }
  };
  return await docClient.put(params).promise();

};


exports.writeUser = (email, name, phone, isBlocked,token, callback) => {  
  const params = {
    TableName: getEnv('users'),
    Item: {
      "email": email,
      "isBlocked": isBlocked,
      "fcmToken":token,
      "phone":phone,
      "name":name,
      "wallet_amount":'0',
      "total_participated":'0',
      "total_challenges_won":'0',
    }
  };
  docClient.put(params, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, data);
    } else {
      console.log(data);
      callback(err, data);
    }
  });
};

exports.scanUserTable = (callback) => {
  const params = {
    TableName: getEnv('users'),
    ProjectionExpression: "email,phone,isBlocked,user_name"
  };
  docClient.scan(params, (err, data) => {
    console.log(data);

    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};

exports.userConsoleOperation = (email, isBlocked, callback) => {
  const params = {

    TableName: getEnv('users'),
    Item: {
      "email": String(email),
      "isBlocked": isBlocked
    }
  };
  docClient.put(params, function(err, data) {
    if (err) {
      console.log(err);
      callback(err, data);
    } else {
      console.log(data);
      callback(err, data);
    }
  });
};
exports.batchWriteItem = (array, callback) => {


  var params = {
    RequestItems: {
      "users": array
    }
  };

  db.batchWriteItem(params, function(err, data) {
    if (err) {
      console.log("Error", err);
      callback(err, data);
    } else {
      console.log("Success", data);
      callback(err, data);
    }
  });
};

exports.fetchSingleUser = (email, callback) => {
  const params = {
    Key: {
      "email": {
        S: email
      },
    },
    TableName: getEnv('users')
  };
  db.getItem(params, function(errUser, dataUser) {
    callback(errUser, dataUser);
  });
};


exports.getPosterData=(callback)=>{
  const params = {
    TableName: getEnv('challenge_banner'),
    ProjectionExpression: "id, image_url"
  };
  docClient.scan(params, (err, data) => {
    console.log(data);
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
}

exports.putPosterData=(id,url, callback)=>{
  const params = {

    TableName: getEnv('challenge_banner'),
    Item: {
      "id": id,
      "image_url":url
    }
  };
  docClient.put(params, function(err, data) {
    callback(err,data);
  });
};
exports.deletePoster = (id, callback) => {
  var fileItem = {
    Key: {
      id: id,
    },
    TableName: getEnv('challenge_banner'),
  };

  docClient.delete(fileItem, function(err, data) {
    callback(err,data);
  });
};


exports.updateResultPublished=(id,boolVal, callback)=>{
  
// Update the item, unconditionally,

var params = {
    TableName:getEnv('challenges'),
    Key:{
        "challengeId": id,
    },
    UpdateExpression: "set isResultPublished = :r",
    ExpressionAttributeValues:{
        ":r":boolVal,
    },
    ReturnValues:"UPDATED_NEW"
};

docClient.update(params, function(err, data) {
   callback(err,data);
});

}


exports.updateUsersChallenges=(email,challenges, total_participated,callback)=>{

var params = {
    TableName:getEnv('users'),
    Key:{
        "email": email,
    },
    UpdateExpression: "set challenges = :c, total_participated= :tp",
    ExpressionAttributeValues:{
        ":c":challenges,
        ":tp":(parseInt(total_participated)+1).toString(),
    },
    ReturnValues:"UPDATED_NEW"
};
docClient.update(params, function(err, data) {
   callback(err,data);
});
}

exports.updateUsersChallengesWon=(email,challengeID,challengesWon,wallet_amount,differenceAmount, total_challenges_won,isResultAlreadyPublished,callback)=>{
  if(isResultAlreadyPublished){
    fetchPreviousTransaction(email,challengeID,(err, resp, deductedAmount)=>{
      if(err) return callback(err,null);
      else {
        let updated_wallet_amt= Math.abs(parseInt(deductedAmount)-parseInt(wallet_amount)); 
        updateUsersWallet(email,challengeID,challengesWon,updated_wallet_amt.toString(),differenceAmount, total_challenges_won,(errUpdation, succUpdation)=>{
          if(errUpdation) callback(errUpdation, null)
          else callback(null, succUpdation)
        })
      }
    })
  }
  else{
    updateUsersWallet(email,challengeID,challengesWon,wallet_amount,differenceAmount, total_challenges_won,(errUpdation, succUpdation)=>{
      if(errUpdation) callback(errUpdation, null)
      else callback(null, succUpdation)
    })
  }
}

const updateUsersWallet=(email,challengeID,challengesWon,wallet_amount,differenceAmount, total_challenges_won,callback)=>{
  var params = {
    TableName:getEnv('users'),
    Key:{
        "email": email,
    },
    UpdateExpression: "set challengesWon = :cw, wallet_amount= :wa, total_challenges_won = :tcw ",
    ExpressionAttributeValues:{
        ":cw":challengesWon,
        ":wa":wallet_amount,
        ":tcw":(parseInt(total_challenges_won)+1).toString()
    },
    ReturnValues:"UPDATED_NEW"
};
docClient.update(params, (err, data)=> {
  if(data){
        if(parseInt(differenceAmount)>0){
          connect.then(db  =>  {
            new Transaction({ email, 
                              value:'+'+differenceAmount,
                              status:'successful',
                              timeStamp:new Date (moment_tz.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a")),
                              action:'acreditado',
                              transactionID:'#'+(Math.floor(Math.random() * 1000000000)).toString(),
                              challengeID,
                              isCancelled:false
          }).save((err, doc)=> {
              if (err) callback(err,null);
              else callback(null,data);
            });     
         });
        }
        else{
          callback(null,data);
        }
  }
  else{
    callback(err,null);
  }
});
}


exports.updateChallenge=(dataChallenge,tokenArr,action,callback)=>{
    var paramsUnitChallenge = {
      Key: {
        "challengeId": {
          S: dataChallenge.challengeId.S
        },
      },
      TableName: getEnv('challenges')
    };
    db.getItem(paramsUnitChallenge, function(errChallenge, dataChallengeGet) {
      let arrImg=[];
      if(dataChallenge.userImg && dataChallenge.userImg.L.length!=0){

      for(var i=0;i<=dataChallenge.userImg.L.length-1;i++){
              var obj={"email":dataChallenge.userImg.L[i].M.email.S,
                        "url":dataChallenge.userImg.L[i].M.url.S,
                        "score":dataChallenge.userImg.L[i].M.score.S,}
              arrImg.push(obj);      
        }
      }
      let arr=[];
        if(dataChallenge.users && dataChallenge.users.L.length!=0){
          for(var i=0;i<=dataChallenge.users.L.length-1;i++){
            arr.push(dataChallenge.users.L[i].S);      
          } 
        }
        let userDataArr=[];
        if(dataChallenge.usersData && dataChallenge.usersData.S!=""){
          userDataArr=JSON.parse(dataChallenge.usersData.S);
        }
        
        const params = {
        TableName: getEnv('challenges'),
        Item: {
          "challengeId": dataChallenge.challengeId.S,
          "users":arr,
          "src": dataChallenge.src.S,
          "end_time": dataChallenge.end_time.S,
          "challengeTime":dataChallenge.end_time.S,
          "challengeDescription": dataChallenge.challengeDescription.S,
          "challengeRules": dataChallenge.challengeRules.S,
          "challengeName": dataChallenge.challengeName.S,
          "challengeType": dataChallenge.challengeType.S,
          "isResultPublished":false,
          "challengePrize": dataChallenge.challengePrize,
          "userImg":arrImg,
          "spots":dataChallenge.spots.S,
          "usersData":JSON.stringify(userDataArr),
          "password":dataChallenge.password=='[]'?'null':dataChallenge.password,
          "passwordTimer":dataChallenge.passwordTimer,
          "createdAt":dataChallenge.createdAt.S,
          "ytLinkParticipationInfo":dataChallenge.ytLinkParticipationInfo.S,
          "ytLinkLobbyTutorial":dataChallenge.ytLinkLobbyTutorial.S,
          'resultTimer':dataChallenge.resultTimer.S,
          'isMatchEnded':dataChallenge.isMatchEnded.S,
          'challengeBase':dataChallenge.challengeBase.S
        }
      }
      docClient.put(params, (err, data)=> {
        if (err) {
          return callback(err, data);
        } else {
          firebaseFile.challengeNotification(action,
            dataChallenge.resultTimer,
            dataChallenge.challengeId.S,
            dataChallenge.challengeName.S,
            (resp,err)=>{})
            let payload={
              'challengeID': dataChallenge.challengeId.S,
              'password':dataChallenge.password,
              'passwordTimer':dataChallenge.passwordTimer,
              'resultTimer' : dataChallenge.resultTimer.S,
              'isMatchEnded':dataChallenge.isMatchEnded.S,
              'end_time': dataChallenge.end_time.S,
              'challengeTime':dataChallenge.end_time.S,
              'challengeDescription': dataChallenge.challengeDescription.S,
              'challengeRules': dataChallenge.challengeRules.S,
              'challengeName': dataChallenge.challengeName.S,
              'challengeType': dataChallenge.challengeType.S,
              'challengePrize': dataChallenge.challengePrize,
              'ytLinkLobbyTutorial':dataChallenge.ytLinkLobbyTutorial.S,
              }
            notifyChangeInChallenges(action, payload);  
          callback(err, data);
        }
      });
  });
};




exports.fetchVideoPresetsData = ( callback) => {
  const params = {
    TableName: getEnv('tutorial_presets'),
    ProjectionExpression: "video_id,iframeCode"
  };
  docClient.scan(params, (err, data) => {
    if (err) {
      console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
      callback(err, data);
    } else {
      data.Items.forEach(function(challenges) {});
      callback(err, data);
      if (typeof data.LastEvaluatedKey != "undefined") {
        params.ExclusiveStartKey = data.LastEvaluatedKey;
        docClient.scan(params, onScan);
      }
    }
  });
};
exports.updateUserFBToken=(email, token, callback)=>{
  var params = {
      TableName:getEnv('users'),
      Key:{
          "email": email,
      },
      UpdateExpression: "set fcmToken = :tk",
      ExpressionAttributeValues:{
          ":tk":token,
      },
      ReturnValues:"UPDATED_NEW"
  };
  docClient.update(params, function(err, data) {
    console.log(err);
    console.log(data);
    callback();
  });
}




exports.createWithdrawRequest=(payload,callback)=>{
  
  
  var params = {
      TableName:getEnv('users'),
      Key:{
          "email": payload.email,
      },
      UpdateExpression: "set wallet_amount = :wa",
      ExpressionAttributeValues:{
          ":wa":(parseInt(payload.oldWalletAmt)-parseInt(payload.amount)).toString(),
      },
      ReturnValues:"UPDATED_NEW"
  };
  
  docClient.update(params, function(err, data) {
    if (err) callback(null);
    else{
      let WithdrawRequest = mongoose.model('withdrawRequests', withdrawRequestSchema);
      let transcationID='#'+(Math.floor(Math.random() * 1000000000)).toString();
      connect.then(db  =>  {
        new WithdrawRequest({
          email:payload.email,
          name: payload.name ,
          amount:payload.amount,
          colID:payload.colID,
          city:payload.city,
          dayName:payload.dayName,
          dateNumber:payload.dateNumber,
          month:payload.month,
          year: payload.year,
          phone:payload.phone,
          newestChallengeDate:payload.newestChallengeDate,
          status:'pending',
          associatedTxnID:transcationID   
          }).save((err, doc)=> {
            if (err) callback(null);
            else {
              connect.then(db  =>  {
              new Transaction({ email:payload.email, 
                          value:'-'+payload.amount,
                          status:'pending',
                          timeStamp:payload.timeStamp,
                          action:'debit',
                          transactionID:transcationID,
                          challengeID:null,
                          isCancelled:false
              }).save((err, doc)=> {
                callback(transcationID)
              });     
          });
          }
        });     
      });


    }
  });
}

exports.getWithdrawalRequests=(callback)=>{

  let WithdrawRequest = mongoose.model('withdrawrequests', withdrawRequestSchema);
  connect.then(db  =>  {
    WithdrawRequest.find({status:"pending"}).then(WithdrawRequests  =>  {
      console.log(WithdrawRequests);
      callback(WithdrawRequests)
    });
  });
}

exports.updateMultipleWithdrawalReq=(idArr, emailArr,callback)=>{
  let WithdrawRequest = mongoose.model('withdrawRequests', withdrawRequestSchema);
  Transaction.updateMany({transactionID: {$in: idArr}}, {$set: {status:'successful'}},  
  async(errUpdate, result)=> {
    if (errUpdate) callback(errUpdate); 
    else {
      await WithdrawRequest.deleteMany({ associatedTxnID: { $in: idArr}}, async (errDelete)=> {
        if(errDelete) callback(errDelete);
        else{
          sendStatusSuccMail(emailArr,()=>{
            callback(null);
          });
        } 
      })
    }
  });
}




const sendStatusSuccMail=(emailArr, cb)=>{
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test.retos2@gmail.com',
      pass: 'fzmczkdbcwyyrpll'
    }
  });

let promises = [];
for (let i = 0; i < emailArr.length; i++) {

  let mailOptions = {
    from: 'test.retos2@gmail.com',
    to: emailArr[i].email,
    subject: 'Tu retiro en Retosgamer ha sido completado',
    text: 'We are happy to inform that your withdrawal request is completed agains your transaction id '+
          emailArr[i].txnID+
          ' for amount '+emailArr[i].amt+' is successful.'
  };

    promises.push(new Promise(function(resolve, reject) {
      transporter.sendMail(mailOptions, (err, info)=> {
            if (err) {
                reject(err)
            } else {
                resolve(info)
            }
        });
    }));
}
Promise.all(promises).then((infos)=> { cb(null, infos) }, (err)=> {console.log(err); cb(err) });
}


exports.sendWithdrawalMailTo3DM=(pdfName, withdrawalID, mailBody,callback)=>{
  const path = require('path');
  let filePath=path.join(require('../app.js').rootPath, pdfName);
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test.retos2@gmail.com',
      pass: 'fzmczkdbcwyyrpll'
    }
  });
  let mailOptions = {
    from: 'test.retos2@gmail.com',
    to: 'sac.co@3dm.com.co',
    subject: `Nueva solicitud de retiro de fondos (ID: ${withdrawalID}) - Retos Gamer `,
    text:mailBody,
    attachments: [
      {
          filename: pdfName, 
          path: filePath, 
          contentType: 'application/pdf'
      }]
  };
  transporter.sendMail(mailOptions, (err, succ)=> {
    if (err) {console.log(err);callback(err);}
    else {
      try {
        fs.unlinkSync(filePath);
        callback(null);
      } catch(err) {
        console.error(errDeletion);
        callback(errDeletion);
      }
    }
  });
}

exports.sendWithdrawalMailToUser=(amount,withdrawalID,timestamp, email,callback)=>{
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'test.retos2@gmail.com',
      pass: 'fzmczkdbcwyyrpll'
    }
  });
  let mailOptions = {
    from: 'test.retos2@gmail.com',
    to: email,
    subject: `Nueva solicitud de retiro de fondos (ID: ${withdrawalID}) - Retos Gamer `,
    html:require('./utility.js').getHtmlEmailText(parseInt(amount)*1000,withdrawalID,timestamp),
  };
  transporter.sendMail(mailOptions, (err, succ)=> {
    if (err) {console.log(err);callback(err);}
    else  callback(null);
  });
}


const notifyChangeInChallenges=(action, payload)=>{

  const challenges = require('../controllers/Challenges.js');

  if(action==='PASSWORD_ANNOUNCED'){
    return challenges.notifyPasswordAnnounced({
      'challengeID':payload.challengeID,
      'password':payload.password,
      'passwordTimer':payload.passwordTimer,
      'ytLinkLobbyTutorial':payload.ytLinkLobbyTutorial,
    })
  }
  else if(action==='DETAILS_UPDATED'){
    challenges.notifyChallengeUpdatedRefresh();
    return challenges.notifyChallengeUpdated({
      'challengeID':payload.challengeID,
      'end_time': payload.end_time,
      'challengeTime':payload.challengeTime,
      'challengeDescription': payload.challengeDescription,
      'challengeRules': payload.challengeRules,
      'challengeName': payload.challengeName,
      'challengeType': payload.challengeType,
      'challengePrize': payload.challengePrize,
    })
  } 
  else if(action==='MATCH_ENDED'){
    challenges.notifyChallengeUpdatedRefresh();
    return challenges.notifyChallengeEnded({
      'challengeID':payload.challengeID,
      'resultTimer' : payload.resultTimer,
      'isMatchEnded':payload.isMatchEnded,
    })
  }
}

const fetchPreviousTransaction=(email, challengeID,callback)=>{


  connect.then( db  =>  {
       Transaction.findOne({"$and": [{email}, {challengeID},{isCancelled:false}]}).then(transaction=>{
         console.log(transaction);
        let transactionAmount=transaction.value;
        connect.then(db  => {
        new Transaction({ 
          email, 
          value:'-'+parseInt(transactionAmount).toString(),
          status:'successful',
          timeStamp:new Date (moment_tz.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a")),
          action:'debit',
          transactionID:'#'+(Math.floor(Math.random() * 1000000000)).toString(),
          challengeID:null,
          isCancelled:false
        }).save((err, doc)=> {
          transaction.isCancelled=true;
          transaction.save(err=>{
            if(err) return callback(err,null,null) 
            else return callback(null,'SUCCESS',transactionAmount)
          }) 
      });     
    });
  })
});
}