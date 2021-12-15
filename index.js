const express = require("express");
const port = 8000;
const db = require("./config/mongoose");
const User = require("./models/user");
const passport = require("passport");
const passportLocal = require("./config/passport-local-strategy");
const passportGoogle = require("./config/passport-google-strategy");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const customMware = require("./config/middleware");
const multer = require("multer");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");

const app = express();
app.use(express.urlencoded());
app.set("view engine", "ejs");
app.set("views", "./views");

app.use(
  session({
    name: "sociauth",
    // TODO change the secret before deployment in production mode
    secret: "nodeauth",
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: MongoStore.create(
      {
        mongoUrl:
          "mongodb+srv://anshurai:anshurai1998@cluster0.trmqx.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
        mongooseConnection: db,
        autoRemove: "disabled",
      },
      function (err) {
        console.log(err || "connect-mongodb setup ok");
      }
    ),
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(passport.setAuthenticatedUser);
//setting up layouts
app.use(expressLayouts);

//setting up extracted static files
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);

app.use(flash());
app.use(customMware.setFlash);

app.use(express.static("./assets"));

app.use("/", require("./routes"));

app.listen(port, function (err) {
  if (err) {
    console.log(`Error in running the server:${err}`);
    return;
  }
  console.log(`Server is running on the port:${port}`);
});
