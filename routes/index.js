const express = require("express")
const bodyparser = require("body-parser")
const websiteController = require("../controllers/websiteController.js")
const userController = require("../controllers/userController.js")
const app = express()
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const UPLOAD_PATH = path.resolve( "public", "uploads")
const upload = multer({
  dest: UPLOAD_PATH,
  limits: {
    fileSize : 10000000,
    files : 4
  }
})
const router = express.Router()

router.get("/", websiteController.load_newly_added)

router.use("/categories", require("./categoryRoutes.js"));
router.use("/users", require("./userRoutes.js"));
router.use("/websites", require("./websiteRoutes.js"));

router.get("/search", function(req,res){
    if (req.session.username){
        if(req.session.role == "admin")
        {   
            res.render("search.hbs",{
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                modurl: "/adminpanel"
            })
        }else{
           res.render("search.hbs",{
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout"
            }) 
        }
    }
    else{
        res.render("search.hbs",{
            rightoption1: "SIGN UP",
            url1: "/users/register",
            rightoption2: "LOG IN",
            url2: "/users/login"
        })
    }
})
// router.get("/webimage/:id", websiteController.load_image)

// router.get("/imageGallery/:id/:filename",websiteController.load_imageGallery)

// router.get("/userimg/:id", userController.load_image)

router.get("/panel/:role", userController.send_adminpage)

router.get("/about", function(req,res){
    let moderatorurl = null
    let userRole
    if(req.session.role == "admin") {
            moderatorurl = "/panel/admin"
            userRole = "Admin"
        }
        else if(req.session.role == "moderator"){
            moderatorurl = "/panel/moderator"
            userRole = "Moderator"
        }
    if(req.session.username){
        res.render("aboutus.hbs",{
            rightoption1: "ACCOUNT",
            url1: ("/users/user-list/"+req.session.username),
            rightoption2: "LOG OUT",
            url2: "/signout",
            loggedin: true,
            modurl: moderatorurl,
            userRole: userRole
        })
    }else{
        res.render("aboutus.hbs",{
            rightoption1: "SIGN UP",
            url1: "/users/register",
            rightoption2: "LOG IN",
            url2: "/users/login"
        })
    }
})

router.get("/signout", function(req, res){
    req.session.destroy()
    res.redirect('back')
})

module.exports = router
