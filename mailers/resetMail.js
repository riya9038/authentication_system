const nodemailer = require("../config/nodemailer");

exports.newPassword = (email) => {
  let htmlString = nodemailer.renderTemplate(
    { email: email },
    "/resetMail/reset-mail.ejs"
  );
  nodemailer.transporter.sendMail(
    {
      from: "9038riya@gmail.com",
      to: email,
      subject: "Reset Password",
      html: htmlString,
    },
    (err, info) => {
      if (err) {
        console.log("error in sending mail", err);
        return;
      }

      console.log("Message sent", info);
      return;
    }
  );
};
