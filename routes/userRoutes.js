const express = require("express")
const bodyparser = require("body-parser")
const userController = require("../controllers/userController.js")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const mongoose = require("mongoose")
const { send_setmoderatorpage, set_moderator } = require("../controllers/userController.js")

const UPLOAD_PATH = path.resolve("public", "uploads")
const upload = multer({
  dest: UPLOAD_PATH,
  limits: {
    fileSize : 10000000,
    files : 4
  }
})

const router = express.Router()

const urlencoder = bodyparser.urlencoded({
    extended: false
})

router.use(urlencoder)

router.get("/user-list/:username", userController.load_user)

router.get("/user-list/:username/editprofile", userController.send_editprofile)

router.get("/user-list/:username/changepassword", userController.send_changepass)

router.post("/user-list/:username/changepassword/submit", userController.change_password)

router.post("/user-list/:username/editprofile/submit", upload.single("profImg"), userController.update_user)

router.get("/user-list/:username/setmoderator", userController.send_setmoderatorpage)

router.post("/user-list/:username/setmoderator/:moderator/submit", userController.set_moderator)

router.get("/register", userController.send_registerpage)

router.post("/register/submit", upload.single("profPic"),userController.register_user)

router.get("/login", userController.send_loginpage)

router.post("/login/submit", userController.login_user)

router.use("/", userController.redirect_userpage)

module.exports = router