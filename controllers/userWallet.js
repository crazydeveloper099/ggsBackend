//jshint esversion:6
const axios = require('axios');
const functionFile = require('../data/dashboard_data.js');
  
const dotenv = require('dotenv');
dotenv.config();
const fs = require('fs');
const rootPath=require('../app.js');
  
//mongoDB
const  mongoose  = require("mongoose");
mongoose.Promise  = require("bluebird");
const  url  =  process.env.mongoURL;
  
const  connect  =  mongoose.connect(url, { useNewUrlParser: true  });
const Schema = mongoose.Schema;
const moment_tz = require('moment-timezone');
const SendmailTransport = require('nodemailer/lib/sendmail-transport');
moment_tz().toString();
const transactionSchema = new Schema({
    email: {type: String},
    timeStamp:{type:String},
    value:{type:String},
    status:{type:String},
    action:{type:String},
  },
  {timestamps: true});
const Amplitude = require('amplitude')
const amplitude = new Amplitude(process.env.amplitudeApiKey)
 
const logUserWalletViewed=async(email)=>{
  const amplitudePayload = {
    event_type: 'USER_WALLET_VIEWED', 
    user_id: email, 
  }
  try {await amplitude.track(amplitudePayload)} catch (err) {console.error(err)}
}
  
let subscriptionData;
const subscriptionFetcher = (phone, callback) => {
  const url = process.env.fetch_userData+phone;
  axios.get(url).then(resp => {
      callback(resp);
    })
    .catch(error => {
    })
};  

exports.showWallet = (req, res) => {
  const cookie = req.cookies;
  if(typeof(cookie.username)  === 'undefined')res.render('login',{name:null});
  else{
  const phone=cookie.phone;
  subscriptionFetcher(phone, async(resp)=>{
    functionFile.fetchSingleUser(req.cookies.email, (err, dataFetched)=>{

        if(err){ 
            res.send(err);
        }
        else if(dataFetched){

        logUserWalletViewed(typeof(cookie.email) === 'undefined' ? '-' : cookie.email)


            res.render('userWallet', {
              name: typeof(cookie.username) === 'undefined' ? null : cookie.username,
              email: typeof(cookie.email) === 'undefined' ? null : cookie.email,
              wallet_balance: typeof(dataFetched.Item.wallet_amount) === 'undefined'?null:dataFetched.Item.wallet_amount.S,
              end_date: typeof(resp.data.end_date) === 'undefined' ? null : resp.data.end_date.S,
              phone: dataFetched.Item.phone.S,
              wallet_amount:dataFetched ? dataFetched.Item.wallet_amount.S:'-'
          });
        }
    });
  });
 }   
}

exports.fetchTransactions = (req, res) => {
  const email= req.cookies.email;
  if(typeof(email) !== 'undefined'){
  
  let Transaction = mongoose.model('userwallettransactions', transactionSchema);
  connect.then(db  =>  {

    Transaction.find({email:email}).then(Transactions  =>  {
      res.setHeader("Content-Type", "application/json");
      res.statusCode  =  200;
      res.send(Transactions)
      });
    });
  }
};


exports.fetchTransactions1 = (email, callback) => {
    console.log('email');

  let Transaction = mongoose.model('userwallettransactions', transactionSchema);
  connect.then(db  =>  {

    Transaction.find({email:email}).then(Transactions  =>  {
      console.log(Transactions);
        callback(Transactions);
      });
    });
};


const savePDFFile=(data, fileName, callback)=>{
  const bufDataFile = new Buffer(data, "utf-8");
  fs.writeFile(rootPath.rootPath+"/"+fileName, bufDataFile, (err)=> {if(err) callback(null); else callback('SUCC_WRITE')})
}

const SendMailTo3Dm=(fileName,withdrawalID, mailBody, callback)=>{
  functionFile.sendWithdrawalMailTo3DM(fileName,withdrawalID,mailBody,(err)=>{if(err) callback(null); else callback('SUCC_SEND')})
}



const withdrawalMail3DMBodyText=(name, coins, colombianID, city, phone, date)=>{
  return `Nombre y Apellido: ${name}
          Monto solicitado: ${coins * 1000}COP 
          C.C. No.: ${colombianID}
          Ciudad: ${city}
          Línea de teléfono: ${phone}
          Fecha de solicitud:  ${date}`
}

const SendMailToUser=(amount,withdrawalID,timestamp, email)=>{
  functionFile.sendWithdrawalMailToUser(amount,withdrawalID,timestamp, email,(err)=>{
    if (err) console.log(err);
    return;
  })
}

exports.processWithdraw=(req,res)=>{
  let name=req.body.name;
  let amount=req.body.amount;
  let colID=req.body.colID;
  let city=req.body.city;
  let dayName = req.body.dayName;
  let dateNumber=req.body.dateNumber;
  let month=req.body.month;
  let year=req.body.year;
  let timestamp=req.body.timestamp;
  //check if balance is greater than available bal
  functionFile.fetchSingleUser(req.cookies.email, (err, dataFetched)=>{
    if(typeof(dataFetched.Item.wallet_amount) === 'undefined' || parseInt(dataFetched.Item.wallet_amount.S)<parseInt(amount)){
      res.send({status:"ERROR",code:"INS_AMT"})
    }
    else{
      let reqID=parseInt(Math.random()*10000000);
      let phone=dataFetched.Item.phone.S;
      let newestChallengeDate=JSON.parse(dataFetched.Item.challenges.S)[0].challengeTime;
      let payload={name,amount,colID,city,dayName,dateNumber,month,year,phone,newestChallengeDate,reqID,timestamp,email:req.cookies.email,oldWalletAmt:dataFetched.Item.wallet_amount.S};
      functionFile.createWithdrawRequest(payload, (withdrawalID)=>{
        if(withdrawalID==null){
          res.send({status:"ERROR",code:"CONNECTION"})
        }
        else{
          
          savePDFFile(req.files.pdf.data, req.files.pdf.name,async(writeStatus)=>{
            if(writeStatus=== 'SUCC_WRITE'){
              SendMailTo3Dm(req.files.pdf.name,withdrawalID, 
                            withdrawalMail3DMBodyText(name,amount, colID, city, phone, timestamp),(sendMailStatus)=>{
                                if(sendMailStatus==='SUCC_SEND'){
                                  SendMailToUser(amount,withdrawalID,timestamp, req.cookies.email)
                                  res.send({status:"SUCCESS",code:"",newestChallengeDate,phone,transactionID:withdrawalID});
                                }
                                else res.send({status:"ERROR",code:"SEND_MAIL_ERR"});
              })
            }
            else res.send({status:"ERROR",code:"FILE_WRITE_ERR"});  
          })      
        }
      })
    }
  });
}