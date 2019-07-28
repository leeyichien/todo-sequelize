// routes/todo.js

const express = require("express");
const router = express.Router();

// 載入 model
const db = require("../models");
const Todo = db.Todo;
const User = db.User;

// 載入 auth middleware
const { authenticated } = require("../config/auth");

// 設定 /todos 路由
// 列出全部 Todo
router.get("/", authenticated, (req, res) => {
  res.send("列出全部 Todo");
});

// 新增一筆 Todo 頁面
router.get("/new", authenticated, (req, res) => {
  return res.render("new");
});

// 顯示一筆 Todo 的詳細內容
router.get("/:id", authenticated, (req, res) => {
  User.findByPk(req.user.id)
    .then(user => {
      if (!user) throw new Error("user not found");

      return Todo.findOne({
        where: {
          UserId: req.user.id,
          Id: req.params.id
        }
      });
    })
    .then(todo => {
      return res.render("detail", { todo: todo });
    })
    .catch(error => {
      return res.status(422).json(error);
    });
});

// 新增一筆  Todo
router.post("/", authenticated, (req, res) => {
  Todo.create({
    name: req.body.name,
    done: false,
    UserId: req.user.id
  })
    .then(todo => {
      return res.redirect("/");
    })
    .catch(error => {
      return res.status(422).json(error);
    });
});

// 修改 Todo 頁面
router.get("/:id/edit", authenticated, (req, res) => {
  User.findByPk(req.user.id)
    .then(user => {
      if (!user) throw new Error("user not found");
      return Todo.findOne({
        where: {
          Id: req.params.id,
          UserId: req.user.id
        }
      });
    })
    .then(todo => {
      return res.render("edit", { todo: todo });
    });
});

// 修改 Todo
router.put("/:id", authenticated, (req, res) => {
  Todo.findOne({
    where: {
      Id: req.params.id,
      UserId: req.user.id
    }
  })
    .then(todo => {
      todo.name = req.body.name;
      todo.done = req.body.done === "on";

      return todo.save();
    })
    .then(todo => {
      return res.redirect(`/todos/${req.params.id}`);
    })
    .catch(error => {
      return res.status(422).json(error);
    });
});
// 刪除 Todo
router.delete("/:id/delete", authenticated, (req, res) => {
  User.findByPk(req.user.id)
    .then(user => {
      if (!user) throw new Error("user not found");

      return Todo.destroy({
        where: {
          UserId: req.user.id,
          Id: req.params.id
        }
      });
    })
    .then(todo => {
      return res.redirect("/");
    })
    .catch(error => {
      return res.status(422).json(error);
    });
});

module.exports = router;
