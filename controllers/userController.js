const User = require("../models/user");
const NewUser = require("../models/resetUser");
const fs = require("fs");
const path = require("path");
const resetPasswordMailer = require("../mailers/resetMail");
const fetch= require('isomorphic-fetch');
const crypto= require('crypto');
const PasswordManager= require('../services/passwordManager');
const dotenv= require('dotenv').config();

//profile page of user
module.exports.profile = function (req, res) {
  User.findById(req.params.id, function (err, users) {
    return res.render("user-profile", {
      title: "Profile",
      profile_user: users,
    });
  });
};

//updating the details of the user
module.exports.update = async function (req, res) {
  if (req.user.id == req.params.id) {
    try {
      let user = await User.findById(req.params.id);

      User.uploadedAvatar(req, res, function (err) {
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
      return res.redirect("back");
    }
  } else {
    req.flash("error", "Unauthorised");
    return res.status(401).send("unauthorised");
  }
};

//rendering the sign up form
module.exports.signUp = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/user/profile");
  }
  return res.render("signUp", {
    title: "SignUp",
  });
};

//rendering the sign in form
module.exports.signIn = function (req, res) {
  if (req.isAuthenticated()) {
    return res.redirect("/user/profile");
  }
  return res.render("signIn", {
    title: "SignIn",
  });
};

//creating the user for the first time
module.exports.create = function (req, res) {
  if (req.body.password != req.body.confirm_password){
    req.flash("error", "Passwords dont match");
    return res.redirect("back");
  }

  User.findOne({ email: req.body.email }, function (err, user) {
    const response_key = req.body["g-recaptcha-response"];
    const secret_key = process.env.SECRETKEY;
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
   
        if (!user && google_response.success == true) {
          User.create(req.body, function (err, user) {
            if (err) {
              console.log("error in creating the user",err);
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

//creating the session for the user who logs in
module.exports.createSession = async function (req, res) {

  const response_key = req.body["g-recaptcha-response"];
  const secret_key = process.env.SECRETKEY;
  const url =`https://www.google.com/recaptcha/api/siteverify?secret=${secret_key}&response=${response_key}`;
  const existingUser= await User.findOne({email:req.body.email});
 
  fetch(url, {
    method: "post",
  })
    .then((response) => response.json())
    .then((google_response) => {

      if (google_response.success == true) {
        //   if captcha is verified
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

//logging the user out of the session
module.exports.destroySession = function (req, res) {
  req.logout();
  req.flash("success", "Logged out successfully");
  return res.redirect("/");
};

//rendering the reset page
module.exports.reset = function (req, res) {
  return res.render("reset", {
    title: "Reset",
  });
};

//sending the mail to the user with the reset link
module.exports.resetEmail = async function (req, res) {
  let user= await User.findOne({ email: req.body.email })
    if (user) {

      let newUser= await NewUser.create({
        user: user.id,
        key:crypto.randomBytes(20).toString('hex'),
        isValid:true
      })

      let resetUser={
        resetDb: newUser,
        user: user
      }
      
      resetPasswordMailer.newPassword(resetUser);
      req.flash("success", "Mail sent");
      return res.render("resetEmail",{
        title: "Reset Email"
      });
    }
     else {
      return res.redirect("back");
    }
};

//rendering the reset form page for chnaging the password
module.exports.resetPassword = async function (req, res) {

  let resetUserDb=await NewUser.findOne({key:req.query.id});

   if(resetUserDb.isValid==true)
   {
      resetUserDb.isValid=false;
      resetUserDb.save();
      return res.render("resetPassword",{
        title: "Reset Password"
      });
   }
   else{
    req.flash('error','Your link has expired!! Directing you to homepage');
    res.redirect('/user/signIn');
   }
};

//updating the reset password in the database
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
      user.password = req.body.confirm_password;
      user.save();
      req.flash("success", "Password reset successfully");
      return res.redirect("/user/signIn");
    } 
    else {
      req.flash("error", "Invalid User");
      return res.redirect("back");
    }
  });
};
