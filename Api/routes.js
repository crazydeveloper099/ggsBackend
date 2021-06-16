const API=require('../data/dashboard_data.js');

const APIMongo=require('../data/dataBaseOpertaionsMongo.js');

const CognitoLoginService=require('../Services/LoginService.js');
const CognitoSignupService=require('../Services/SignUpService.js');
const utilities =require('./utilities.js');
const customSort=require('./utilities.js').customSort;
const Participate=require('../controllers/Challenges.js').postChallenge11;
const RefreshElements=require('../controllers/Challenges.js').notifyChallengeUpdatedRefresh;
const ChallengeFunc=require('../controllers/Challenges.js');
const authService = require('../Services/SignUpService.js');
const wallet=require('../controllers/userWallet.js');
const fbAdmin= require('../controllers/firebase_admin.js');
const MulticraftAPI  = require("multicraft-api-node");

const multicraftApi = new MulticraftAPI({
    url: "https://budget.bisecthosting.com/api.php",
    user: process.env.mcUser,
    key: process.env.mcUserKey
  });

exports.getLoginDetails=async(req,res)=>{
    const email=req.body.dataObj.profile.email
    const name=req.body.dataObj.profile.name
    const image=req.body.dataObj.profile.image
    const authType=req.body.dataObj.authType
    const password=req.body.dataObj.profile.password
    const token=req.body.dataObj.profile.token
    API.fetchSingleUser(email,async(errRes, succRes)=>{
        if(Object.keys(succRes).length !== 0) 
         {
            if(authType=='Self'){
                const data={
                    username: email,
                    password: password,
                };
                CognitoLoginService.Login(data,(err,result)=>{
                    API.updateUserFBToken(email,token,()=>{
                        if(err) res.send({'status':'error','saved':false,'msg':err})
                        else if(result) res.send({'status':'success','saved':true,'msg':null})
                    })
                },true);
            }
            else{
                API.updateUserFBToken(email,token,()=>{
                res.send({'status':'success','saved':true,'msg':null});
                })
            }
        }
        
        else{

            if(authType=='Self'){
                const data={
                    username: email,
                    password: password,
                    token: token
                };
                CognitoLoginService.Login(data,(err,result)=>{
                    API.updateUserFBToken(email,token,()=>{
                    if(err) res.send({'status':'error','saved':false,'msg':"User doesn't Exist"})
                    else if(result) res.send({'status':'verification','saved':false,'msg':"User Verification required"})
                    })
                },true);
            }
            else{
                await API.createUser(
                email, //email
                name,  //name
                null,  //phone
                false, //isBlocked
                token,    //token
                image, //image
                authType) //authType
                .then(
                    value=>{
                        res.send({'status':'success','saved':true,'msg':null})
                    },
                    err=>{
                        res.send({'status':'failure','saved':false,'msg':err})
                    }
                )
            }
        }
    })
}
exports.getSignupDetails=async(req,res)=>{
    const email=req.body.dataObj.profile.email;
    const name=req.body.dataObj.profile.name;
    const image=req.body.dataObj.profile.image;
    const authType=req.body.dataObj.authType;
    const password=req.body.dataObj.profile.password;
    const token=req.body.dataObj.profile.token

    API.fetchSingleUser(email,async(errRes, succRes)=>{
        if(Object.keys(succRes).length !== 0) {return res.send({'status':'error','saved':false,'msg':'Este usuario ya existe'})}
            const data={
                name,
                password,
                email,
            };
            CognitoSignupService.Register(data, async(err, result)=>{

                API.writeUser(email, name,'+570000000',false,token,async(errVer,dataVer)=>{
                    if(err || errVer) return res.send({'status':'error','saved':false,'msg':err});
                    else return res.send({'status':'success','saved':true,'msg':null})
                });
        });
    })
}

exports.getChallenges=async(req,res)=>{
    API.dbChallengeFetcher(req.body.eventType, async( err, data)=>{
        if(err) return res.send({'status':'error', data:null});
        else{
            await data.Items.sort(customSort);
            return res.send({'status':'success', data});
    } 
})};

exports.getSpecificChallenge=(req,res)=>{
    API.fetchSingleChallenge(req.body.id,req.body.eventType,(err, resp)=>{
        if(err) return res.send({'status':'error', data:null, err:err});
        else return res.send({'status':'success', data:resp, err:null});
})};

exports.participate=async(req,res)=>{
    const email=req.body.email;
    const challengeID=req.body.challengeID;
    const username=req.body.username;

    if(req.files!=null && req.body.eventType=='Minecraft'
    || req.body.eventType=='StaticChallenge'){

        utilities.uploadFileFromReq(req.files.file, challengeID,req.body.eventType,email,(url)=>{
            if(url!=null){
                Participate(email, challengeID, username,
                    req.body.eventType, 
                    url,
                    req.body.gameScore,(data=>{
                    if(data.status=='success') {RefreshElements()};
                    return res.send(data)
                }))
            }
        })
    }
    else{
        Participate(email, challengeID, username,req.body.eventType,'url', '',(data=>{
            if(data.status=='success') {RefreshElements()};
        return res.send(data)
    }))
    }
}

exports.checkParticipation=(req,res)=>{
    const email=req.body.email;
    const challengeID=req.body.challengeID;
    const eventType=req.body.eventType;
    API.fetchSingleChallenge(challengeID,eventType,(err,data)=>{
        ChallengeFunc.checkParticipation2(data,email,((isParticipated,username)=>{
            return res.send({isParticipated,username})
        }))
    })
}

exports.checkLeaderboard=(req,res)=>{
    API.fetchResult(req.body.eventType,(err, data)=>{
        if(err) return res.send({'status':'error', data:null,  err:err});
        else return res.send({'status':'success', data:data,  err:null});
    })
}

exports.getInvividualResult=(req,res)=>{
    const challengeID=req.body.challengeID;
    const eventType=req.body.eventType;
    API.fetchUnitResult(challengeID,eventType,(err, data)=>{
        if(err) return res.send({'status':'error', data:null,  err:err});
        else return res.send({'status':'success', data:data,  err:null});
    })
}

exports.getFeaturedEvents=(req,res)=>{
    API.getPosterData((err, data) => {
        if(err) return res.send({'status':'error', data:null,  err:err});
        else return res.send({'status':'success', data:data,  err:null});
  });
}

exports.verifyCode=(req,res)=>{
    const email=req.body.email;
    const code=req.body.code;
    authService.verifyUserFunction(email,
        code,
        false, 
        function(err, result){
        if(err) return res.send({'status':'error'});
        else return res.send({'status':'success'});
    })
}

exports.getProfileData=(req,res)=>{
    const email=req.body.email;
    API.fetchSingleUser(email,(err,data)=>{
        res.header("Access-Control-Allow-Origin", "*");
        if(err) return res.send({'status':'error', data:null});
        else return res.send({'status':'success',data});
    })
}

exports.getWalletTransactions=(req,res)=>{
    wallet.fetchTransactions1(req.body.email,(data) => {
        return res.send({'status':'success',data});
      })
}

exports.resendCode=(req,res)=>{
    const email=req.body.email;
    const code=req.body.code;
    authService.verifyUserFunction(email,
        null,
        true, 
        function(err, result){
        if(err) return res.send({'status':'error'});
        else return res.send({'status':'success'});
    })
}

exports.resetPassword=(req,res)=>{
    authService.forgetPassword(req.body.email,(err, data)=>{
        if(err){
            return res.send({'status':'error'});
        }
        else if(data){
            return res.send({'status':'success'});
        }
      });
}
exports.newPassword=(req,res)=>{
authService.confirmPassword(req.body.email, req.body.code, req.body.password ,(err, data)=>{
    if(err){
        return res.send({'status':'error'});
    }
    else if(data){
        return res.send({'status':'success'});
    }
  });
}

exports.subscribeTokenFCM=(req,res)=>{
    fbAdmin.subscribe(req.body.token,'all',(result)=>{
        res.send('OK')
    })
}



exports.mcWhitelistUser=(req,res)=>{
    
    multicraftApi.getServerStatus({"id":`${process.env.mcServerID}`})
    .then(checkMCServerRes=>{

   checkMCServerRes.success?
       checkMCServerRes.data.status!='offline'?
            multicraftApi.sendConsoleCommand({"server_id":`${process.env.mcServerID}`, 
            "command":`easywl add ${req.body.username}`})
                .then((data) =>{
                    API.updateMCUsername(req.body.email,req.body.username,(err, data)=>{
                        if(err){
                            console.log(err)
                            res.send({status:'ERR'})}
                        else{res.send({status:'OK'})}
                    })
                })
                .catch((err) => {
                    res.send({status:'ERR'});
                })
            :res.send({status:'ERR'})
        :res.send({status:'ERR'});
    })
    .catch(err=>res.send({status:'ERR'}))    
}