//jshint esversion:6
const data = require('../data/dashboard_data.js');
let dataArray=[];
exports.getCaregoriesApi=(callback)=>{
  data.getCategory((errCategory,dataCategory)=>{
    if(dataCategory){
      dataCategory.Items.map((datai,i)=>{
        data.fetchCategoriesData(datai.categoryId,(errData,dataTabelItem)=>{

          if(typeof dataTabelItem.Items != "undefined" &&
          dataTabelItem.Items != null &&
          dataTabelItem.Items.length != null &&
          dataTabelItem.Items.length > 0){
          let obj={
            "key":datai.categoryId,
            "data":dataTabelItem.Items
          };
          dataArray.push(obj);
          if(i===dataCategory.Items.length-1){
            
            callback(dataArray);
            dataArray=[];
            return;
          }
        }
      });
      });
    }
    else {
      callback(null);
      return;
    }
});
};
exports.getTableData=(req,res)=>{

};