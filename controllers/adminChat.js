//jshint esversion:6
const data = require('../data/dashboard_data.js');

exports.getLayout = (req, res) => {
    const challengeId=req.query.id;

  const cookie = req.cookies;
  const isValidLogin = req.cookies.isValid;
  
  if (isValidLogin) {
      data.fetchUnitResult(challengeId, (userData) => {
        if (userData) {
          res.render('adminChat', {
            name: cookie.adminUser,
            // userData: JSON.parse(userData.Item.resultData.S),
            // unitChallenge: JSON.parse(userData.Item.unitChallenge.S).Item,
            challengeId:challengeId.includes('.')?challengeId.split('.')[0]+challengeId.split('.')[1]:challengeId,
            end_date: null
          });
        } else res.send(err);
      });
  } else res.redirect('/admin');
};