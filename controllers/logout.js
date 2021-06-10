//jshint esversion:6

exports.getLogout= (req,res)=> {
     res.clearCookie('username');
     res.clearCookie('email');
     res.clearCookie('phone');
     res.redirect('/dashboard');
}