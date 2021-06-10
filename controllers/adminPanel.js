//jshint esversion:8
const dataFile = require('../data/dashboard_data.js');
exports.getAdminPanel = async(req, res) => {
  const cookie = req.cookies;
  const isValidLogin = req.cookies.isValid;
  const publishSuccess = req.cookies.publishSuccess;
  const deleteChallenge = req.cookies.deleteChallenge;
  const resultPublish = req.cookies.resultPublished;
  const updateChallenge = req.cookies.updatedChallenge;
  let shouldShow = false;
  let showMessage;
  if (typeof(cookie.publishSuccess) !== 'undefined') {
    res.clearCookie("publishSuccess", {
      httpOnly: true
    });
    showMessage = "Published Challenge Successfully!";
    shouldShow = true;
  }
  if (typeof(cookie.deleteChallenge) !== 'undefined') {
    res.clearCookie("deleteChallenge", {
      httpOnly: true
    });
    showMessage = "Deleted Challenge Successfully!";
    shouldShow = true;
  }
  if (typeof(cookie.resultPublished) !== 'undefined') {
    res.clearCookie("resultPublished", {
      httpOnly: true
    });
    showMessage = "Result Published Successfully!";
    shouldShow = true;
  }
  if (typeof(cookie.deleteResult) !== 'undefined') {
    res.clearCookie("deleteResult", {
      httpOnly: true
    });
    showMessage = "Result Deleted Successfully!";
    shouldShow = true;
  }
  if (typeof(cookie.updateChallenge) !== 'undefined') {
    res.clearCookie("updatedChallenge", {
      httpOnly: true
    });
    showMessage = "Challenge Updated Successfully!";
    shouldShow = true;
  }
  if (isValidLogin && typeof(cookie.adminUser) !== 'undefined') {

    let eventsList=
    ['LiveEvent',
    'Minecraft',
    'StaticChallenge',
    'Tournaments',
    'normalEvents']

    let eventObj={
      LiveEvent:[],
      Minecraft:[],
      StaticChallenge:[],
      Tournaments:[],
      normalEvents:[]
    }

  dataFile.challengeFetcher('LiveEvent', async(err, data) => {
    await data.Items.sort(custom_sort);
    eventObj.LiveEvent=data.Items
    dataFile.challengeFetcher('Minecraft', async(err, data) => {
      await data.Items.sort(custom_sort);
      eventObj.Minecraft=data.Items;
      dataFile.challengeFetcher('StaticChallenge', async(err, data) => {
        await data.Items.sort(custom_sort);
        eventObj.StaticChallenge=data.Items;
        dataFile.challengeFetcher('Tournaments', async(err, data) => {
          await data.Items.sort(custom_sort);
          eventObj.Tournaments=data.Items;
          dataFile.challengeFetcher('normalEvents', async(err, data) => {
            await data.Items.sort(custom_sort);
            eventObj.normalEvents=data.Items;
              res.render('adminPanel', {
                name: typeof(cookie.adminUser) === 'undefined' ? null : cookie.adminUser,
                end_date: null,
                successMessage: shouldShow,
                showMessage: showMessage,
                eventsObj:eventObj,
                eventsArr:eventsList
              });
          })
        })
      })
    })
  }) 
  } else res.redirect('/admin');
};


const findPublishedChallenges = async (dataAdmin, dataDashboard, callback) => {
  const challengeData = await dataFile.dbChallengeFetcher(function(err, dataDashboardNew) {

    if (err) {
      res.send(err);
    } else if (dataDashboardNew) {
      for (let i = 0; i < dataAdmin.data.length; i++) {
        dataAdmin.data[i].isPublished = false;
        for (let j = 0; j < dataDashboardNew.Items.length; j++) {
          if (dataAdmin.data[i].competition_id === dataDashboardNew.Items[j].challengeId) {
            dataAdmin.data[i].isPublished = true;
            break;
          }
        }
      }
      findPublishedResults(dataAdmin, (err, resultData) => {
        callback(err, resultData);
      });
    }
  });
};
const findPublishedResults = (dataAdmin, callback) => {
  const challengeData = dataFile.fetchResult(function(err, resultData) {

    if (resultData) {
      for (let i = 0; i < dataAdmin.data.length; i++) {
        dataAdmin.data[i].isResultPublished = false;
        for (let j = 0; j < resultData.Items.length; j++) {
          if (dataAdmin.data[i].competition_id === resultData.Items[j].challengeId) {
            dataAdmin.data[i].isResultPublished = true;
            break;
          }
        }
      }
    }
    callback(err, dataAdmin);
  });
};

exports.postAdminPanel = (req, res) => {
  console.log(1111111111,req.body,req.cookies.activeEvent );
  const del = req.body.deleteButton;
  const manage= req.body.manageButton;
  const result = req.body.publishResult;
  const resultUpdate = req.body.publish;
  const deleteResult = req.body.deleteResult;
  // const new_category = req.body.category_new;
  // const dropdownValue = req.body.dropdownValue;

  dataFile.challengeFetcher(req.cookies.activeEvent,(err, dataChallenges) => {
    dataChallenges=dataChallenges.Items;
  // if (req.body.publish === 'true') {
  //   dataChallenges.map((datai, i) => {
  //     if (datai.competition_id === id) {
  //       if (new_category) {
  //         dataFile.createCategory(new_category, (errFile, dataFile) => {
  //           if (errFile) {
  //             res.send(errFile);
  //           } else if (dataFile) {
  //             addChallenge.postAddChallenge(datai, req.body.prize, new_category, (err, data) => {
  //               if (err) {
  //                 res.send(err);
  //               } else {
  //                 if (err1) {
  //                   res.send(err1);
  //                 } else {
  //                   datai.challengePrize = req.body.prize;
  //                   dataChallenges.splice(i, 1, datai);
  //                   res.cookie('publishSuccess', true, {
  //                     httpOnly: true
  //                   });
  //                   res.redirect('/adminPanel');
  //                 }
  //               }
  //             });
  //           }
  //         });
  //       } else if (dropdownValue) {
  //         addChallenge.postAddChallenge(datai, req.body.prize, dropdownValue, (err, data) => {
  //           if (err) {
  //             res.send(err);
  //           } else {
  //             datai.challengePrize = req.body.prize;
  //             dataChallenges.splice(i, 1, datai);
  //             res.cookie('publishSuccess', true, {
  //               httpOnly: true
  //             });
  //             res.redirect('/adminPanel');
  //           }
  //         });
  //       }
  //     }

  //   });

  // } 
  if (del === 'true') {
    dataChallenges.map(datai => {
      
      if (datai.challengeId === req.body.delete) {
        dataFile.deleteChallenge(req.cookies.activeEvent, req.body.delete, function(err, data) {
           
          if (err) {

            res.cookie('deleteChallenge', false, {
              httpOnly: true
            });
            res.redirect('/adminPanel');
          } else if (data) {
            res.cookie('deleteChallenge', true, {
              httpOnly: true
            });
            notifyChallengeDeleted(datai.challengeId)
            res.redirect('/adminPanel');
          }
        });
      }
    });
  } else if (result === 'true' ) {
    dataChallenges.map(datai => {
      if (datai.challengeId === req.body.resultButton) {
        res.cookie('resultPublish', datai.challengeId, {
          httpOnly: true
        });
        res.redirect('/declareResult');
      }
    });
  } 
  else if (resultUpdate === 'true') {
    console.log("yes");
    dataChallenges.map(datai => {

      if (datai.challengeId === req.body.resultButton) {
        res.cookie('resultPublish', datai.challengeId, {
          httpOnly: true
        });
        res.redirect('/declareResult');
      }
    });
  } 
  else if (deleteResult === 'true') {
      dataFile.deleteChallenge(req.cookies.activeEvent+'_Result', req.body.deleteResultId, (err, data)=> {
        dataFile.updateResultPublished(req.body.deleteResultId, false,req.cookies.activeEvent,(errUpdate, dataUpdate)=>{

        if (err) {
          res.cookie('deleteResult', false, {
            httpOnly: true
          });
          res.redirect('/adminPanel');
        } else if (data) {
          res.cookie('deleteResult', true, {
            httpOnly: true
          });
          res.redirect('/adminPanel');
        }
      });
    });
  }
  else if(manage ==='true'){
    dataChallenges.map(datai => {
      if (datai.challengeId === req.body.manage) {
        res.cookie('manageChallenge', datai.challengeId, {
          httpOnly: true
        });
        res.redirect('/manageChallenge');
      }
    });
  }
});
};

function custom_sort(a, b) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

const notifyChallengeDeleted=(challengeID)=>{
  require('./Challenges.js').notifyChallengeDeleted(challengeID);
}