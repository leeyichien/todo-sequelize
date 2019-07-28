// app.js

const express = require("express");
const app = express();
// 判別開發環境
if (process.env.NODE_ENV !== "production") {
  // 如果不是 production 模式
  require("dotenv").config(); // 使用 dotenv 讀取 .env 檔案
}
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const session = require("express-session");
const passport = require("passport");

// 載入 model
const db = require("./models");
const Todo = db.Todo;
const User = db.User;

const port = 3000;

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const flash = require("connect-flash"); // 載入 connect-flash

app.use(
  session({
    secret: "todo_sequelize",
    resave: "false",
    saveUninitialized: "false"
  })
);
// 使用 Passport - 要在「使用路由器」前面
app.use(passport.initialize());
app.use(passport.session());
require("./config/passport")(passport);
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// 登入後可以取得使用者的資訊方便我們在 view 裡面直接使用
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.isAuthenticated = req.isAuthenticated(); // 辨識使用者是否已經登入的變數，讓 view 可以使用
  next();
});

app.use(flash()); // 使用 Connect flash

// 建立 local variables
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.isAuthenticated = req.isAuthenticated(); // 辨識使用者是否已經登入的變數，讓 view 可以使用

  // 新增兩個 flash message 變數
  res.locals.success_msg = req.flash("success_msg");
  res.locals.warning_msg = req.flash("warning_msg");
  next();
});

// 使用路由器
app.use("/", require("./routes/home"));
app.use("/users", require("./routes/user"));
app.use("/todos", require("./routes/todo"));
app.use("/auth", require("./routes/auths")); // 把 auth route 加進來

// 設定 express port 3000
app.listen(port, () => {
  console.log(`App is running on port ${port}!`);
});
