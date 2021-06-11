//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const fileUpload = require('express-fileupload');
const flash = require('express-flash-messages');

const cors =require('cors');
const app=express();
const http = require('http').Server(app);

const options={
  cors:true,
  origins:["http://127.0.0.1:4000"],
}

const io = require('socket.io')(http,options);

exports.io=io;
require('dotenv').config();


app.use(express.json())
app.use(cors())


const admin = require('./controllers/admin.js');
const adminChat = require('./controllers/adminChat.js');

const challenges = require('./controllers/Challenges.js');
const adminPanel = require('./controllers/adminPanel.js');
const declareResult =require('./controllers/declareResult.js');

const adminUserOperations=require('./controllers/adminUserOperation.js');
const blockedUser=require('./controllers/blockedAccount.js');

const getAddChallenge = require('./controllers/addChallenge.js');
const getPosterConsole = require('./controllers/posterConsole.js');
const notificationClickHandler= require('./controllers/fcmClickHandler.js');
const manageChallenge =require('./controllers/manageChallenge.js');
const payoutWinnersRoute =require('./controllers/payoutWinners.js');
const userWallet=require('./controllers/userWallet');
const selectParticipants=require('./controllers/selectParticipants');
const userWalletManagement=require('./controllers/userWalletManagement.js');

//API Imports
const Routes= require('./Api/routes.js')

exports.rootPath=__dirname;
app.use(fileUpload());
app.use(cookieParser('secret'));
app.use(express.static(__dirname + '/public'));
app.use(flash());
app.use(bodyParser.json({ limit:'50MB'}));
app.use(bodyParser.json({ limit:'50MB'})).use(bodyParser.urlencoded());
app.set('view engine', 'ejs');





app.get('/admin',admin.loginModal);
app.post('/admin',admin.postAdmin);
app.get('/adminPanel',adminPanel.getAdminPanel);
app.post('/adminPanel',adminPanel.postAdminPanel);
app.get('/declareResult',declareResult.getResults);

app.post('/declareResult',declareResult.uploadMiddleWare);
app.get('/userConsole',adminUserOperations.getUserConsole);
app.get('/payoutWinners',payoutWinnersRoute.renderPayoutWinners);
app.get('/chats',adminChat.getLayout)

app.get('/userWalletManagement',userWalletManagement.get);
app.post('/userWalletManagement',userWalletManagement.post);
app.post('/userConsole',adminUserOperations.postUserConsole);
app.get('/blockedUser', blockedUser.getBlockedUser);
app.get('/addChallenge',getAddChallenge.getAddChallenge);
app.post('/addChallenge',getAddChallenge.postAddChallenges);
app.get('/posterConsole',getPosterConsole.get);
app.post('/posterConsole',getPosterConsole.post);
app.post('/challenge',challenges.postChallenge12);
app.get('/notifHandler', notificationClickHandler.challengeClicked);
app.get('/notifLeaderboardHandler', notificationClickHandler.leaderboardClicked);
app.get('/manageChallenge',manageChallenge.getManageScreen);
app.post('/manageChallenge',manageChallenge.postManage);
app.post('/processWithdraw',userWallet.processWithdraw)
app.post('/payoutWinners',payoutWinnersRoute.changeStatusOfWithdrawal)
app.post('/updateWalletAmount',adminUserOperations.updateWalletAmount);
app.get('/selectParticipants',selectParticipants.getUserConsole);


io.on('connection',(socket=>{

  socket.on('username', function (username_from_client) {
     socket.username = username_from_client;
 
     io.emit('userConnected', socket.username);
   });
 
   //handle adding a message to the chat.
   socket.on('addChatMessage(client->server)', function (msgObj) {
     msgObj=JSON.parse(msgObj)
     let roomID=msgObj.ID
     roomID=roomID.includes('.')?roomID.split('.')[0]+roomID.split('.')[1]:roomID
     let automatedRes=null;
     if('automatedRes' in msgObj){
      automatedRes=msgObj.automatedRes;
     }
     let Chat = mongoose.model(roomID, chatSchema);
     var message=prepareMessageToClients(socket, msgObj.msg)
     let automated_response=prepareAutomatedResponseToClients( automatedRes)
     connect.then(db  =>  {
      new Chat({ message, 
                sender: socket.username, 
                timeStamp:new Date (moment_tz.tz(new Date(), "GMT").utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a")),
                automatedRes:automated_response
    }).save((err, doc)=> {
        if (err) return console.error(err);
        else io.emit('addChatMessage(server->clients)', [socket.username, message,msgObj.ID,automated_response]);
      });     
   });
  });
 
  socket.on('blockUser(client->server)', function (blockUserObj) {
    blockUserObj=JSON.parse(blockUserObj)
    let roomID=blockUserObj.ID
    roomID=roomID.includes('.')?roomID.split('.')[0]+roomID.split('.')[1]:roomID

    let BlockedUserDB = mongoose.model(roomID+"_blocked", blockUserSchema);
    connect.then(db  =>  {
     new BlockedUserDB({ sender: blockUserObj.userName}).save((err, doc)=> {
       if (err) io.emit('blockUser(server->clients)', ['failure',blockUserObj.userName]);
       else io.emit('blockUser(server->clients)', ['success',blockUserObj.userName]);
     });     
  });
 });
 
  
   socket.on('userIsTypingKeyDown(client->server)', function (challengeId) {
     io.emit('userIsTypingKeyDown(server->clients)', [socket.username, prepareIsTypingToClients(socket),challengeId]);
   });
   socket.on('userIsTypingKeyUp(client->server)', function (challengeId) {
     io.emit('userIsTypingKeyUp(server->clients)', [socket.username,challengeId]);
   });
 
   socket.on('disconnect', function () {
     io.emit('userDisconnected', socket.username);
     console.log('disconnected...');
   });
}));


// app.use(function(req, res, next) {
//      res.header("Access-Control-Allow-Origin", "*");
//      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//      next();
// });

app.post('/getLoginDetails', Routes.getLoginDetails)
app.post('/getSignupDetails', Routes.getSignupDetails)
app.post('/getChallenges', Routes.getChallenges)
app.post('/getSpecificChallenge', Routes.getSpecificChallenge);
app.post('/participate', Routes.participate);
app.post('/checkParticipation', Routes.checkParticipation);
app.post('/getLeaderBoardEvents', Routes.checkLeaderboard);
app.post('/getIndividualresult',Routes.getInvividualResult);
app.get('/getfeaturedEventsPosters',Routes.getFeaturedEvents);
app.post('/verifyCode',Routes.verifyCode);
app.post('/getProfile',Routes.getProfileData);
app.post('/getWalletTransactions',Routes.getWalletTransactions);
app.post('/resendCode',Routes.resendCode);
app.post('/resetPassword',Routes.resetPassword);
app.post('/newPassword',Routes.newPassword);
app.post('/subscribeFCM',Routes.subscribeTokenFCM)
app.post('/mcWhitelistUser',Routes.mcWhitelistUser)
http.listen(4000, function() {
  console.log(process.env.NODE_ENV);
});