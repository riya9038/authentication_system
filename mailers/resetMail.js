const nodemailer = require("../config/nodemailer");

exports.newPassword = (resetUser) => {
  let htmlString = nodemailer.renderTemplate(
    { resetUser: resetUser },
    "/resetMail/reset-mail.ejs"
  );
  nodemailer.transporter.sendMail(
    {
      from: "9038riya@gmail.com",
      to: resetUser.user.email,
      subject: "Reset Password",
      html: htmlString,
    },
    (err, info) => {
      if (err) {
        console.log("error in sending mail", err);
        return;
      }

      return;
    }
  );
};
