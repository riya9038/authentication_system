const User = require("../models/user");
const fs = require("fs");
const path = require("path");
const resetPasswordMailer = require("../mailers/resetMail");
const fetch= require('isomorphic-fetch');

module.exports.profile = function (req, res) {
  User.findById(req.params.id, function (err, users) {
    return res.render("user-profile", {
      title: "Profile",
      profile_user: users,
    });
  });
};

module.exports.update = async function (req, res) {
  if (req.user.id == req.params.id) {
    try {
      let user = await User.findById(req.params.id);

      User.uploadedAvatar(req, res, function (err) {
        console.log(req.file, "request");
        if (err) {
          console.log("***Error in Multer", err);
        }

        user.name = req.body.name;
        user.email = req.body.email;

        if (req.file) {
          if (user.avatar) {
            fs.unlinkSync(path.join(__dirname, "..", user.avatar));
          }

          user.avatar = User.avatarPath + "/" + req.file.filename;
        }
        user.save();
        return res.redirect("back");
      });
    } catch (err) {
      req.flash("error", "Error");
      console.log(err);
      return res.redirect("back");
    }
  } else {
    req.flash("error", "Unauthorised");
    return res.status(401).send("unauthorised");
  }
};

module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/user/profile");
  }
  return res.render("signUp", {
    title: "SignUp",
  });
};

module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/user/profile");
  }
  return res.render("signIn", {
    title: "SignIn",
  });
};

module.exports.create = function (req, res) {
  if (req.body.password != req.body.confirm_password){
    req.flash("error", "Passwords dont match");
    return res.redirect("back");
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    const response_key = req.body["g-recaptcha-response"];
    const secret_key = "6LeqG6UdAAAAAFVXKKLfPtSpFUHYJlDLl6waV76p";
    const url =`https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;

    if (err) {
      console.log("error in finding the user");
      return;
    }
    fetch(url, {
      method: "post",
    })
      .then((response) => response.json())
      .then((google_response) => {
   
        // google_response is the object return by
        // google as a response
        if (!user && google_response.success == true) {
          User.create(req.body, function (err, user) {
            if (err) {
              console.log("error in finding the user");
              return;
            } else {
              return res.redirect("/user/signIn");
            }
          });
        } else {
          return res.redirect("back");
        }
      }).catch((error) => {
        // Some error while verify captcha
      return res.json({ error });
    });
});
}

module.exports.createSession = function (req, res) {

  const response_key = req.body["g-recaptcha-response"];
  const secret_key = "6LeqG6UdAAAAAFVXKKLfPtSpFUHYJlDLl6waV76p";
  const url =`https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;
 
  // Making POST request to verify captcha
  fetch(url, {
    method: "post",
  })
    .then((response) => response.json())
    .then((google_response) => {
 
      // google_response is the object return by
      // google as a response
      if (google_response.success == true) {
        //   if captcha is verified
        console.log("creating session");
        req.flash("success", "Logged in successfully");
        return res.redirect("/user/profile");
      } else {
        // if captcha is not verified
        return res.send({ response: "Failed" });
      }
    })
    .catch((error) => {
        // Some error while verify captcha
      return res.json({ error });
    });
};


module.exports.destroySession = function (req, res) {
  req.logout();
  req.flash("success", "Logged out successfully");
  return res.redirect("/");
};
module.exports.reset = function (req, res) {
  return res.render("reset");
};
module.exports.resetEmail = async function (req, res) {
  await User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      console.log("error in finding the user");
      return;
    }
    if (user) {
      res.render("resetEmail");
      resetPasswordMailer.newPassword(req.body.email);
      req.flash("success", "Mail sent");
      console.log("mail sent", req.body.email);
    } else {
      return res.redirect("back");
    }
  });
};
module.exports.resetPassword = function (req, res) {
  return res.render("resetPassword");
};
module.exports.updatePassword = function (req, res) {
  User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      console.log("error in finding the user");
      return;
    }
    if (user) {
      if (req.body.password !== req.body.confirm_password) {
        req.flash("error", "Passwords dont match");
        return res.redirect("back");
      }
      console.log("old password", user.password);
      console.log("user", user);
      user.password = req.body.confirm_password;
      user.save();
      console.log("new password", req.body.confirm_password);
      req.flash("success", "Password reset successfully");
      return res.redirect("/user/signIn");
    } else {
      req.flash("error", "Invalid User");
      return res.redirect("back");
    }
  });
};
