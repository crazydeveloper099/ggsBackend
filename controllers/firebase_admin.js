const path = require('path');
const admin= require('firebase-admin');
const pathToServiceAccount=path.resolve('./controllers/fb_admin_sdk.json');
const serviceAccount = require(pathToServiceAccount);
const dotenv = require('dotenv');
const moment = require('moment-timezone');
moment().toString();
dotenv.config();


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://retosgamer-328be.firebaseio.com"
  });


let registrationTokens = [];


exports.sendPushNotification=(message, callback)=>{
  if(process.env.NODE_ENV=='development'){
    admin.messaging().send(message)
    .then((response)=>{
        callback();
    })
    .catch((err)=>{
        callback()
    })
  }
  else{
    callback();
  }
  
}

exports.subscribe=(token, topic,callback)=> {
  if(process.env.NODE_ENV=='development'){
    registrationTokens.push(token);
    admin.messaging().subscribeToTopic(registrationTokens, topic)
    .then(function(response) {
      callback(null,response);
    })
    .catch(function(error) {
      callback(error,null);
    });
  }
  else{
    callback();
  }
}

exports.sendToTopic=(challengeName,challengeId,eventType,callback)=>{
  if(process.env.NODE_ENV=='development'){
      const message = {    
        webpush: {
          notification:{
            title:challengeName+" Evento añadido",
            body:"¡Únete y entra a la sala para ganar!",
            icon: 'https://retos-bucket.s3.us-east-2.amazonaws.com//static/ggsLogoNoBg.png',
            click_action: 'https://ggslatam.gg/events/'+eventType+'/'+challengeId
        },
      },
        topic: 'all'
    };

    admin.messaging().send(message)
      .then((response) => {
        callback(null,response);
      })
      .catch((error) => {
        callback(error,null);
      });
    }
    else{
      callback();
    }
}



exports.sendToTopicResults=(challengeName,challengeId,eventType,callback)=>{
  if(process.env.NODE_ENV=='development'){

      const message = {
        
      webpush: {
        notification:{
          title:challengeName+" resultados anunciados",
          body:"Revisa las posiciones",
          icon: 'https://retos-bucket.s3.us-east-2.amazonaws.com//static/ggsLogoNoBg.png',
          click_action: 'https://ggslatam.gg/leaderboard#'+eventType+"#"+challengeId
      },
    },
      topic: 'all'
    };

    admin.messaging().send(message)
      .then((response) => {
        callback(null,response);
      })
      .catch((error) => {
        callback(error,null);
      });
    }
    else{
      callback();
    }
}

exports.challengeNotification=(action,resultTime,challengeId,challengeName,eventType,callback)=>{
  
  if(process.env.NODE_ENV=='development'){


    const message = {webpush: {},topic: 'all'};
    
    if(action==='PASSWORD_ANNOUNCED'){
      message.webpush.notification=
        {title:challengeName+" El código de la sala ha sido anunciado",
        body:"¡Únete y entra a la sala para ganar!",
        icon: 'https://retos-bucket.s3.us-east-2.amazonaws.com//static/ggsLogoNoBg.png',
        click_action: 'https://ggslatam.gg/events/'+eventType+'/'+challengeId
}    } 
    else if(action==='DETAILS_UPDATED'){
      message.webpush.notification=
      {title:'Se ha modificado el evento '+challengeName,
      body:"Mira los cambios ahora.",
      icon: 'https://retos-bucket.s3.us-east-2.amazonaws.com//static/ggsLogoNoBg.png',
        click_action: 'https://ggslatam.gg/events/'+eventType+'/'+challengeId
}      } 

    else if(action==='MATCH_ENDED'){
      message.webpush.notification=
      {title:"El reto "+challengeName+" ha finalizado",
      body:"",
      icon: 'https://retos-bucket.s3.us-east-2.amazonaws.com//static/ggsLogoNoBg.png',
        click_action: 'https://ggslatam.gg/events/'+eventType+'/'+challengeId
}    


      var now = moment(moment.tz(new Date(), "GMT")
                .utcOffset(-300).format("MM/DD/YYYY hh:mm:ss a"),'MM/DD/YYYY hh:mm:ss a')
                .valueOf()
      var distance = new Date(resultTime.S).getTime() - now;
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    if(days<1){
      if(hours>0){
        message.webpush.notification.body="El resultado se anunciará en "+hours+" horas y "+minutes + " minutos";  
      }
      else{
        message.webpush.notification.body="El resultado se anunciará en "+minutes + "minutos ";
      }
    }
     
    else{
      message.webpush.notification.body="El resultado se anunciará en "+days+" day(s)";  
    }  
  }
     

  admin.messaging().send(message)
    .then((response) => {
      callback(null,response);
    })
    .catch((error) => {
      callback(error,null);
    });
  }
  else{
    callback
  }
}