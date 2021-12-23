const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");
const dotenv= require('dotenv').config();

let transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "9038riya@gmail.com",
    pass: process.env.PASSWORD,
  },
});

let renderTemplate = (data, relativePath) => {
  let mailHTML;
  ejs.renderFile(
    path.join(__dirname, "../views/mailer", relativePath),
    data,
    function (err, template) {
      if (err) {
        console.log("error in rendering the template", err);
        return;
      }

      mailHTML = template;
    }
  );
  return mailHTML;
};

module.exports = {
  transporter: transporter,
  renderTemplate: renderTemplate,
};
