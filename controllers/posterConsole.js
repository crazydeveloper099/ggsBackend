//jshint esversion:6
const fs = require("fs");
const functionFile = require("../data/dashboard_data.js");
const uploadFile = require("../data/upload_file.js");

const rootPath = require("../app.js");

exports.get = (req, res) => {
  functionFile.getPosterData((err, data) => {
    console.log(data);
    res.render("posterConsole", { name: null, data: data.Items });
  });
};

exports.post = (req, res) => {
  console.log(req.body);
  if (req.body.deleteButton === "true") {
    functionFile.deletePoster(req.body.delete, (err,data)=>{
        if(err)res.send(err);
        else res.redirect('/posterConsole');
    })
  } else {
    const bufDataFile = Buffer.from(req.files.screenshot.data, "utf-8");
    const fname = Math.random() * Math.pow(10, 15) + "poster";
    fs.writeFile(
      rootPath.rootPath + "/" + fname + ".jpg",
      bufDataFile,
      function (err) {
        uploadFile.uploadFile(
          rootPath.rootPath + "/" + fname + ".jpg",
          fname,
          "posters",
          (url) => {
            fs.unlinkSync(rootPath.rootPath + "/" + fname + ".jpg");
            functionFile.putPosterData(fname, url,req.body.title, req.body.description, req.body.href, (err, data) => {
              if (err) {
                res.render(err);
              } else res.redirect("/posterConsole");
            });
          }
        );
      }
    );
  }
};
