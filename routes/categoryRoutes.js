const express = require("express")
const bodyparser = require("body-parser")
const categoryController = require("../controllers/categoryController.js")

const urlencoder = bodyparser.urlencoded({
    extended: false
})

const router = express.Router()

router.use(urlencoder)

router.get("/allcategories", categoryController.load_all)

router.get("/socialmedia", categoryController.load_social_categ)

router.get("/ecommerce", categoryController.load_ecomm_categ)

router.get("/newssites", categoryController.load_newssite_categ)

router.get("/blogs", categoryController.load_blogs_categ)

router.get("/informational", categoryController.load_infom_categ)

router.get("/entertainment", categoryController.load_entert_categ)

router.get("/utilities", categoryController.load_util_categ)

router.get("/:category/filter", categoryController.filter_category)

router.get("/", categoryController.redirect_index)

module.exports = router;