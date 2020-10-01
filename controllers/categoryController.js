const express = require("express")
const bodyparser = require("body-parser")
const Website = require("../models/website.js")
const Review = require("../models/review.js")
const mongoose = require("mongoose")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const e = require("express")

const UPLOAD_PATH = path.resolve("public", "uploads")
const upload = multer({
  dest: UPLOAD_PATH,
  limits: {
    fileSize : 10000000,
    files : 2
  }
})
const load_social_categ = function(req,res){

    let userRole
    let modurl
    Website.getByCategory("Social Media").then(function(docs){
        if (req.session.username){
            if(req.session.role == "admin"){
                userRole = "Admin"
                modurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                modurl = "/panel/moderator"
            }
            res.render("categories.hbs",{
                Category: "Social Media",
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                loggedin : true,
                userRole: userRole,
                modurl: modurl,
                websites: docs
            })
        }
        else{
            res.render("categories.hbs",{
                Category: "Social Media",
                rightoption1: "SIGN UP",
                url1: "/users/register",
                rightoption2: "LOG IN",
                url2: "/users/login",
                loggedin: false,
                websites: docs
            })
        }
    })
}

const load_ecomm_categ = function(req,res){
    let userRole
    let modurl
    Website.getByCategory("E-Commerce").then(function(docs){
        if (req.session.username){
            
            if(req.session.role == "admin"){
                userRole = "Admin"
                modurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                modurl = "/panel/moderator"
            }
            res.render("categories.hbs",{
                Category: "E-Commerce",
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                loggedin : true,
                userRole: userRole,
                modurl: modurl,
                websites: docs
            })
        }
        else{
            res.render("categories.hbs",{
                Category: "E-Commerce",
                rightoption1: "SIGN UP",
                url1: "/users/register",
                rightoption2: "LOG IN",
                url2: "/users/login",
                loggedin: false,
                websites: docs
            })
        }
    })
}

const load_newssite_categ = function(req,res){
    let userRole
    let modurl
    Website.getByCategory("News Sites").then(function(docs){
        if (req.session.username){
            if(req.session.role == "admin"){
                userRole = "Admin"
                modurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                modurl = "/panel/moderator"
            }
            res.render("categories.hbs",{
                Category: "News Sites",
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                loggedin : true,
                userRole: userRole,
                modurl: modurl,
                websites: docs
            })
        }
        else{
            res.render("categories.hbs",{
                Category: "News Sites",
                rightoption1: "SIGN UP",
                url1: "/users/register",
                rightoption2: "LOG IN",
                url2: "/users/login",
                loggedin: false,
                websites: docs
            })
        }
    })
}

const load_blogs_categ = function(req,res){
    let userRole
    let modurl
    Website.getByCategory("Blogs").then(function(docs){
        if (req.session.username){
            if(req.session.role == "admin"){
                userRole = "Admin"
                modurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                modurl = "/panel/moderator"
            }
            res.render("categories.hbs",{
                Category: "Blogs",
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                loggedin : true,
                userRole: userRole,
                modurl: modurl,
                websites: docs
            })
        }
        else{
            res.render("categories.hbs",{
                Category: "Blogs",
                rightoption1: "SIGN UP",
                url1: "/users/register",
                rightoption2: "LOG IN",
                url2: "/users/login",
                loggedin: false,
                websites: docs
            })
        }
    })
}

const load_infom_categ = function(req,res){
    let userRole
    let modurl
    Website.getByCategory("Informational").then(function(docs){
        if (req.session.username){
            if(req.session.role == "admin"){
                userRole = "Admin"
                modurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                modurl = "/panel/moderator"
            }
            res.render("categories.hbs",{
                Category: "Informational",
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                loggedin : true,
                userRole: userRole,
                modurl: modurl,
                websites: docs
            })
        }
        else{
            res.render("categories.hbs",{
                Category: "Informational",
                rightoption1: "SIGN UP",
                url1: "/users/register",
                rightoption2: "LOG IN",
                url2: "/users/login",
                loggedin: false,
                websites: docs
            })
        }
    })
}

const load_entert_categ = function(req,res){
    let userRole
    let modurl
    Website.getByCategory("Entertainment").then(function(docs){
        if (req.session.username){
            if(req.session.role == "admin"){
                userRole = "Admin"
                modurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                modurl = "/panel/moderator"
            }
            res.render("categories.hbs",{
                Category: "Entertainment",
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                loggedin : true,
                userRole: userRole,
                modurl: modurl,
                websites: docs
            })
        }
        else{
            res.render("categories.hbs",{
                Category: "Entertainment",
                rightoption1: "SIGN UP",
                url1: "/users/register",
                rightoption2: "LOG IN",
                url2: "/users/login",
                loggedin: false,
                websites: docs
            })
        }
    })
}

const load_util_categ = function(req,res){
    let userRole
    let modurl
    Website.getByCategory("Utilities").then(function(docs){
        if (req.session.username){
            if(req.session.role == "admin"){
                userRole = "Admin"
                modurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                modurl = "/panel/moderator"
            }
            res.render("categories.hbs",{
                Category: "Utilities",
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                loggedin : true,
                userRole: userRole,
                modurl: modurl,
                websites: docs
            })
        }
        else{
            res.render("categories.hbs",{
                Category: "Utilities",
                rightoption1: "SIGN UP",
                url1: "/users/register",
                rightoption2: "LOG IN",
                url2: "/users/login",
                loggedin: false,
                websites: docs
            })
        }
    })
}

const filter_category = function(req,res){
    let category = req.params.category
    let tag = req.query.tagfilters
    let sortby = req.query.sortby
    let orderby = req.query.orderby
    let userRole
    let modurl
    if(category == "All Websites"){
        Website.getAllFiltered(tag, sortby, orderby).then(function(docs){
            if (req.session.username){
                if(req.session.role == "admin"){
                    userRole = "Admin"
                    modurl = "/panel/admin"
                }else if(req.session.role == "moderator"){
                    userRole = "Moderator"
                    modurl = "/panel/moderator"
                }
                res.render("categories.hbs",{
                    Category: category,
                    rightoption1: "ACCOUNT",
                    url1: ("/users/user-list/"+req.session.username),
                    rightoption2: "LOG OUT",
                    url2: "/signout",
                    loggedin : true,
                    userRole: userRole,
                    modurl: modurl,
                    websites: docs
                })
            }
            else{
                res.render("categories.hbs",{
                    Category: category,
                    rightoption1: "SIGN UP",
                    url1: "/users/register",
                    rightoption2: "LOG IN",
                    url2: "/users/login",
                    loggedin: false,
                    websites: docs
                })
            }
        }, function(err){
            console.log(err)
        })
       
    }else{
    Website.filterCategory(category, tag, sortby, orderby).then(function(docs){
        if (req.session.username){
            if(req.session.role == "admin"){
                userRole = "Admin"
                modurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                modurl = "/panel/moderator"
            }
            res.render("categories.hbs",{
                Category: category,
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                loggedin : true,
                userRole: userRole,
                modurl: modurl,
                websites: docs
            })
        }
        else{
            res.render("categories.hbs",{
                Category: category,
                rightoption1: "SIGN UP",
                url1: "/users/register",
                rightoption2: "LOG IN",
                url2: "/users/login",
                loggedin: false,
                websites: docs
            })
        }
    })
    }
}
const load_all = function(req,res){
    let userRole
    let modurl
    Website.getAll().then(function(docs){
        if (req.session.username){
            if(req.session.role == "admin"){
                userRole = "Admin"
                modurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                modurl = "/panel/moderator"
            }
            res.render("categories.hbs",{
                Category: "All Websites",
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                loggedin : true,
                userRole: userRole,
                modurl: modurl,
                websites: docs
            })
        }
        else{
            res.render("categories.hbs",{
                Category: "All Websites",
                rightoption1: "SIGN UP",
                url1: "/users/register",
                rightoption2: "LOG IN",
                url2: "/users/login",
                loggedin: false,
                websites: docs
            })
        }
    })
}

const redirect_index = function(req,res){
    res.redirect("/")
} 

module.exports = {
    load_social_categ,
    load_ecomm_categ,
    load_newssite_categ,
    load_blogs_categ,
    load_infom_categ,
    load_entert_categ,
    load_util_categ,
    filter_category,
    load_all,
    redirect_index
}