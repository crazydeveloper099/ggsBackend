const fs = require('fs');
const rootPath=require('../app.js');
const uploadFile= require('../data/upload_file.js');

exports.customSort=(a, b)=> {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

exports.uploadFileFromReq=(file,challengeID,eventType,mail,callback)=>{
  var dir = rootPath.rootPath+'/public/uploads/';

  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
  if(file!=null){
    const bufDataFile = Buffer.from(file.data, "utf-8");
    const fname = challengeID+new Date().toISOString();
    fs.writeFile(
      rootPath.rootPath+"/public/uploads/"+challengeID+'.jpg',
      bufDataFile,
      function (err) {
        uploadFile.uploadFile(
          rootPath.rootPath+"/public/uploads/"+challengeID+'.jpg',
          fname,
          eventType+"/"+challengeID+"/"+mail,
          (url) => {
            fs.unlinkSync(rootPath.rootPath+"/public/uploads/"+challengeID+'.jpg');
            callback(url)
          })
        })
      }
  }