//jshint esversion:6
const dataFile = require('../data/dashboard_data.js');
const data = require('../data/upload_file.js');
const rootPath=require('../app.js');
const fs = require('fs');
const fb=require('./firebase_admin.js');
const io=require('../app.js').io;
const dbOperationsMongo=require('../data/dataBaseOpertaionsMongo.js');

exports.getAddChallenge=(req,res)=>{
  dataFile.getCategory((errCategory, dataCategory) => {
    dataFile.fetchVideoPresetsData((errFetching, videoPresetsData) => {
      res.render('addChallenge',{name:null,end_date:null, dataCategory:dataCategory.Items, videoPresetsData});
    });
  });
};

exports.postAddChallenges=(req,res)=>{
  const jData= JSON.parse(req.body.jsonData);
 const bufDataFile = new Buffer(req.files.screenshot.data, "utf-8");
 const bufDataFile2 = new Buffer(req.files.screenshot2.data, "utf-8");

 const fname=String(Math.random()*Math.pow(10,17));
 var dir = rootPath.rootPath+'/public/uploads/';
 if (!fs.existsSync(dir)){
   fs.mkdirSync(dir);
}
  fs.writeFile(rootPath.rootPath+"/"+fname+'.jpg', bufDataFile, function(err) {
    fs.writeFile(rootPath.rootPath+"/"+fname+'-c'+'.jpg', bufDataFile2, function(err) {
    
      data.uploadFile(rootPath.rootPath+"/"+fname+'.jpg',fname , 'challenges', (url)=>{
          data.uploadFile(rootPath.rootPath+"/"+fname+'-c'+'.jpg',fname+'-c' , 'challenges', (url2)=>{

      fs.unlinkSync(rootPath.rootPath+"/"+fname+'.jpg');
      fs.unlinkSync(rootPath.rootPath+"/"+fname+'-c'+'.jpg');

      const challengeName=jData.challengeName;
      const challengeType= jData.challengeType;
      const end_time=jData.end_time;
      const image=url;
      const carouselImg=url2;
      const id=fname;
      const description=jData.desc;
      const rules=jData.rules;
      const challengePrize=jData.prize;
      const spots=jData.spots;
      const minLevel=jData.minLevel;
      const createdAt=jData.createdAt;
      const ytLinkParticipation=jData.ytLinkParticipation;
      const eventType=jData.eventType;
      const liveStreamWidgetType=jData.liveStreamWidgetType;
      const livestreamUrl=jData.livestreamUrl;
      const BattlefyLink=jData.BattlefyLink;
      const endTimeStaticEvt=jData.endTimeStaticEvt;
      dataFile.createEvent(
            id,
            image,
            end_time,
            description,
            rules,
            challengeName,
            challengePrize,
            challengeType,
            spots,
            minLevel,
            createdAt,
            ytLinkParticipation,
            eventType,
            liveStreamWidgetType,
            livestreamUrl,
            BattlefyLink,
            endTimeStaticEvt,
            carouselImg,
            (err,data)=>{
            if(err)
            {
              res.render(err);
            }
            else if(data){
              fb.sendToTopic(challengeName,id,eventType,(errFcm, resFcm)=>{
                if(errFcm){
                  res.send(errFcm);
                }
               else{
                  res.cookie('publishSuccess', true, {
                    httpOnly: true
                  });
                  res.redirect('/adminPanel'); 
                  notifySocket(); 
               }
             });   
            }
          });
  });
});
});
});
};

const notifySocket=()=>{
  io.emit('challengeAdded',true)
}