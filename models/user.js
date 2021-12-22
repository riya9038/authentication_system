const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const AVATAR_PATH = path.join("/uploads/users/avatars");
const PasswordManager= require('../services/passwordManager');
const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre('save',async function(done){
  if(this.isModified('password')){
      const hashed=await PasswordManager.toHash(this.get('password'));
      this.set('password',hashed);
  }

  done();
})

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "..", AVATAR_PATH));
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  },
});

//static methods
UserSchema.statics.uploadedAvatar = multer({ storage: storage }).single(
  "avatar"
);
UserSchema.statics.avatarPath = AVATAR_PATH;

const User = mongoose.model("User", UserSchema);
module.exports = User;
