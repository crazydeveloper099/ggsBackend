const dataFile = require('../data/dashboard_data.js');

exports.get = async(req, res) => {
    const cookie = req.cookies;
    const isValidLogin = req.cookies.isValid;
    if (isValidLogin && typeof(cookie.adminUser) !== 'undefined') {
        res.render('adminPanel', {
            name: typeof(cookie.adminUser) === 'undefined' ? null : cookie.adminUser,
            end_date: null,
            successMessage: shouldShow,
            showMessage: showMessage,
            eventsObj:eventObj,
            eventsArr:eventsList
          });
    } else res.redirect('/admin');
}

exports.post=async(req,res)=>{
    
}