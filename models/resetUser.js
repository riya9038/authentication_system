const mongoose = require("mongoose");
const NewUserSchema = new mongoose.Schema(
    {
        user:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:'User'
        },
        key: {
            type: String,
            required: true,
        },
        isValid:{
            type: Boolean,
            required: true,
        }
    },
    {
      timestamps: true,
    }
  );
  const NewUser = mongoose.model("NewUser", NewUserSchema);
  module.exports = NewUser;