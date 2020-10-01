const express = require("express")
const bodyparser = require("body-parser")
const websiteController = require("../controllers/websiteController.js")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
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

router.get("/websitelist/:websiteid", websiteController.load_website)

router.get("/websitelist/:websiteid/review", websiteController.send_reviewpage)

router.get("/websitelist/:websiteid/review/edit", websiteController.send_editreview)

router.post("/websitelist/:websiteid/review/edit/submit", websiteController.update_review)

router.post("/websitelist/:websiteid/review/submit", websiteController.submit_review)

router.get("/websitelist/:websiteid/review/delete/:username", websiteController.send_deletereview)

router.post("/websitelist/:websiteid/review/delete/:username/submit", websiteController.delete_review)

router.get("/search-results", websiteController.search_results)

router.get("/submitsite", websiteController.send_submitsitepage)

router.post("/submitsite/submit", upload.fields([{name: "webImg", maxCount: 1}, {name: "webBanner", maxCount: 1},{name: "imgsGal", maxCount: 3}]), websiteController.submit_website)

router.get("/websitelist/:websiteid/edit", websiteController.send_editwebsite)

router.post("/websitelist/:websiteid/edit/submit", upload.fields([{name: "webImg", maxCount: 1}, {name: "webBanner", maxCount: 1},{name: "imgsGal", maxCount: 3}]), websiteController.update_website)

router.get("/websitelist/:id/publish/:publish", websiteController.send_unpublishpage)

router.post("/websitelist/:id/publish/:publish/submit", websiteController.unpublishpage)

router.get("/weboftheday/:id", websiteController.send_weboftheday)

router.post("/weboftheday/:id/submit", websiteController.set_weboftheday)

router.get("/websitelist/:id/delete", websiteController.send_deletepage)

router.post("/websitelist/:id/delete/submit", websiteController.delete_website)

module.exports = router;  