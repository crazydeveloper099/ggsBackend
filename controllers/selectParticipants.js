//jshint esversion:6

const functionFile = require('../data/dashboard_data.js');


exports.getUserConsole=(req,res)=>{
  const cookie = req.cookies;
  const isValidLogin = req.cookies.isValid;
  if (isValidLogin && typeof(cookie.adminUser) !== 'undefined') {
  functionFile.scanUserTable((err, data)=>{
   
  res.render('selectParticipants',
  {
    name: typeof(cookie.adminUser) === 'undefined' ? null : cookie.adminUser,
    data: data.Items,
    end_date: null,
  });
});
}
else res.redirect('/admin');
};
