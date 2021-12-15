const mongoose = require("mongoose");
const mongo_uri =
  "mongodb+srv://anshurai:anshurai1998@cluster0.trmqx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

mongoose.connect(mongo_uri);

const db = mongoose.connection;

db.once("error", (error) => console.error("Error connecting to DB", error));
db.once("open", () => console.log("Connected to DB"));

module.exports = db;
