//jshint esversion:6

const data = require('../data/dashboard_data.js');
const model = require('../models/UserModel.js');

exports.getAboutUs = (req, res) => {
  const cookie = req.cookies;
  const phone=cookie.phone;

      res.render('About_us', {
              name: typeof(cookie.username) === 'undefined' ? null : cookie.username,
              tandc: typeof(cookie.tandc) === 'undefined' ? null : cookie.tandc,
              end_date: null
            });
};
