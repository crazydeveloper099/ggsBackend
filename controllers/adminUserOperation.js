//jshint esversion:6

const functionFile = require('../data/dashboard_data.js');


exports.getUserConsole=(req,res)=>{
  const cookie = req.cookies;
  const isValidLogin = req.cookies.isValid;
  if (isValidLogin && typeof(cookie.adminUser) !== 'undefined') {
  functionFile.scanUserTable((err, data)=>{
    console.log(data.Items);

  res.render('adminUserOperations',
  {
    name: typeof(cookie.adminUser) === 'undefined' ? null : cookie.adminUser,
    data: data.Items,
    end_date: null,
  });
});
}
else res.redirect('/admin');
};

exports.postUserConsole=(req,res)=>{
  console.log(req.body);
  const data1=JSON.parse(req.body.jsonData1.replace("'",""));
  const data2=JSON.parse(req.body.jsonData2.replace("'",""));

console.log(data1[0]);
console.log(data2[0]);
  if(data1.length===1){
    console.log("data1[0], data2[0]"+"11111");

    functionFile.userConsoleOperation(data1[0],true,(err,data)=>{
        if(err)res.end(err);
        else res.redirect('/adminPanel');
    });
  }
  if(data2.length===1){
    console.log("data1[0], data2[0]"+"1111122222");

    functionFile.userConsoleOperation(data2[0],false,(err,data)=>{
      if(err)res.end(err);
      else res.redirect('/adminPanel');
    });
  }
};

exports.updateWalletAmount=(req,res)=>{
  const email=req.body.email;
  const walletAmount=req.body.wallet;
  functionFile.updateWalletAmount(email, walletAmount, (err, succ)=>{
    if(err) res.send('Fail');
    else res.send('Success')
  })
}
