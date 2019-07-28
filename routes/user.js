// routes/user.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcryptjs"); // 載入 bcryptjs library

// 載入 user model
const db = require("../models");
const User = db.User;
// 登入頁面
router.get("/login", (req, res) => {
  res.render("login");
});
// 登入檢查
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login"
  })(req, res, next);
});
// 註冊頁面
router.get("/register", (req, res) => {
  res.render("register");
});
//  註冊檢查

router.post("/register", (req, res) => {
  const { name, email, password, password2 } = req.body;

  // 加入錯誤訊息提示
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ message: "所有欄位都是必填" });
  }

  if (password !== password2) {
    errors.push({ message: "密碼輸入錯誤" });
  }

  if (errors.length > 0) {
    res.render("register", {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ where: { email: email } }).then(user => {
      if (user) {
        // 檢查 email 是否存在
        console.log("User already exists");
        // 加入訊息提示
        errors.push({ message: "這個 Email 已經註冊過了" });
        res.render("register", {
          // 使用者已經註冊過
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          // 如果不存在就直接新增
          name,
          email,
          password
        });

        // 先用 genSalt 產生「鹽」，第一個參數是複雜度係數，預設值是 10
        bcrypt.genSalt(10, (err, salt) =>
          // 再用 hash 把鹽跟使用者的密碼配再一起，然後產生雜湊處理後的 hash
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;

            // 用 bcrypt 處理密碼後，再把它儲存起來
            newUser
              .save()
              .then(user => {
                res.redirect("/");
              })
              .catch(err => console.log(err));
          })
        );
      }
    });
  }
});

// 登出
router.get("/logout", (req, res) => {
  req.logout();
  // 加入訊息提示
  req.flash("success_msg", "你已經成功登出");
  res.redirect("/users/login");
});
module.exports = router;
