const express = require("express");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const { auth } = require("./routes/authRoute");
const { user } = require("./routes/userRoute");
const keys = require("./config/keys");
require("./utils/passport");

const app = express();

// DataBase Connection
const mongoose = require("mongoose");
mongoose.connect(keys.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("MongoDB has been connected.");
});

// Setup middleware
app.use(express.json());
app.use(cookieParser());
app.use("/images", express.static("images"));
app.use(passport.initialize());

// Setup routers
app.use("/api", auth);
app.use("/api", user);

// Setup Server
const PORT = process.env.PORT || keys.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
