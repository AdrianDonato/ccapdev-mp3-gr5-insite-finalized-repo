const express = require("express")
const bodyparser = require("body-parser")
const User = require("../models/user.js")
const Review = require("../models/review.js")
const Website = require("../models/website.js")
const session = require("express-session")
const mongoose = require("mongoose")
const cloudinary = require("cloudinary").v2
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const crypto = require("crypto")
const { isNull } = require("util")


const UPLOAD_PATH = path.resolve("public", "uploads")
const upload = multer({
  dest: UPLOAD_PATH,
  limits: {
    fileSize : 10000000,
    files : 4
  }
})

const load_user = function(req,res){
        /*
            1. load user details
            2. load list of reviews
            3. load list of websites created
        */
        let username = req.params.username
        let moderatorurl = null
        let profpic
        let userRole

        if(req.session.role == "admin") {
            moderatorurl = "/panel/admin"
            userRole = "Admin"
        }
        else if(req.session.role == "moderator"){
            moderatorurl = "/panel/moderator"
            userRole = "Moderator"
        }
        
        User.get(username).then((doc)=>{
            
            if(doc.usericon){
                profpic = doc.usericon
            }else{
                profpic = "https://bootdey.com/img/Content/avatar/avatar7.png"
            }
            /*check if the profile is user's own, show edit button if true*/
            
            if(req.params.username == req.session.username){    
                res.render("userprofile.hbs",{
                    rightoption1: "ACCOUNT",
                    url1: "/users/user-list/"+ req.session.username,
                    rightoption2: "LOG OUT",
                    url2: "/signout",
                    loggedin: "true",
                    ownpage: "true",
                    user: doc,
                    profpic : profpic,
                    modurl: moderatorurl,
                    userRole: userRole
                })
            }else{
                res.render("userprofile.hbs",{
                    rightoption1: "ACCOUNT",
                    url1: "/users/user-list/"+ req.session.username,
                    rightoption2: "LOG OUT",
                    url2: "/signout",
                    loggedin: "true",
                    user: doc,
                    profpic: profpic,
                    modurl: moderatorurl,
                    userRole: userRole
                })
            }
        console.log("Loaded User :" + JSON.stringify(doc))
        },(err)=>{
            console.log(err)
            res.render("error.hbs")
        })
}
function uploadIconGetLink(req,res){
    return new Promise(resolve=>{
        cloudinary.uploader.upload(req.file.path).then(function(iconlink){
            resolve(iconlink.url)
        },function(err){
            console.log(err)
            res.render("error.hbs")
        })
    },function(err){
        console.log(err)
        res.render("error.hbs")
    })
}

const send_editprofile = function(req,res){
        let userRole
        let modurl
    if(req.session.username){
        User.get(req.params.username).then((doc)=>{
            if(doc.filename){
                profpic = "/userimg/" + doc.id
            }else{
                profpic = "https://bootdey.com/img/Content/avatar/avatar7.png"
            }
            if(req.session.role == "admin"){
                userRole = "Admin"
                modurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                modurl = "/panel/moderator"
            }
            res.render("editprofile.hbs", {
                rightoption1: "ACCOUNT",
                url1: "/users/user-list/" + req.session.username,
                rightoption2: "LOG OUT",
                url2: "/signout",
                user: doc,
                editprofile: true,
                modurl: modurl,
                userRole: userRole,
                profpic: profpic,
                editprofilesubmit: "/users/user-list/"+ req.session.username + "/editprofile/submit"
              })
        },(err)=>{
            console.log(err)
            res.render("error.hbs")
        })
    }
}
const send_changepass = function(req, res){
    let userRole
    let modurl
    if(req.session.username){
    User.get(req.params.username).then((doc)=>{
        if(doc.filename){
            profpic = "/userimg/" + doc.id
        }else{
            profpic = "https://bootdey.com/img/Content/avatar/avatar7.png"
        }
        if(req.session.role == "admin"){
            userRole = "Admin"
            modurl = "/panel/admin"
        }else if(req.session.role == "moderator"){
            userRole = "Moderator"
            modurl = "/panel/moderator"
        }
        res.render("editprofile.hbs", {
            rightoption1: "ACCOUNT",
            url1: "/users/user-list/" + req.session.username,
            rightoption2: "LOG OUT",
            url2: "/signout",
            user: doc,
            modurl: modurl,
            userRole: userRole,
            changepass: true,
            profpic: profpic,
            editprofilesubmit: "/users/user-list/"+ req.session.username + "/editprofile/submit"
          })
    },(err)=>{
        console.log(err)
        res.render("error.hbs")
    })
}
}
const change_password = function(req, res){
    let npassword = req.body.pw
    let vnpassword = req.body.vpw
    let oldpass = req.body.opw
    let username = req.session.username

    if(req.session.username){
        User.get(req.session.username).then(function(doc){
            if(doc.password ==  crypto.createHash("md5").update(oldpass)){
                if(vnpassword == npassword){
                    User.update_password(username, oldpass, npassword).then(function(doc){
                        res.redirect("/users/user-list/" + req.session.username)
                    }, function(err){
                        console.log(err)
                        res.redirect("error.hbs")
                    })
                }else{
                    res.render("editprofile.hbs",{
                        rightoption1: "ACCOUNT",
                        url1: "/users/user-list/" + req.session.username,
                        rightoption2: "LOG OUT",
                        url2: "/signout",
                        user: doc,
                        modurl: modurl,
                        error: "Passwords do not match. Please verify your new password.",
                        userRole: userRole,
                        changepass: true,
                        profpic: profpic,
                        editprofilesubmit: "/users/user-list/"+ req.session.username + "/editprofile/submit"
                    })
                }
            }
            else{
                res.render("editprofile.hbs",{
                    rightoption1: "ACCOUNT",
                    url1: "/users/user-list/" + req.session.username,
                    rightoption2: "LOG OUT",
                    url2: "/signout",
                    user: doc,
                    modurl: modurl,
                    error: "Old password does not match. Please enter old password.",
                    userRole: userRole,
                    changepass: true,
                    profpic: profpic,
                    editprofilesubmit: "/users/user-list/"+ req.session.username + "/editprofile/submit"
                }) 
            }
        }, function(err){
            console.log(err)
            res.render("error.hbs")
        })
        
    }else{
        res.redirect("/login")
    }
}


const update_user = async function(req,res){
    let nEmail = req.body.em
    let nFname = req.body.fname
    let nLname = req.body.lname
    
    let imgIcon
    
    if(req.file){
        imgIcon = await uploadIconGetLink(req, res)
        User.update_wImg(req.params.username, nEmail, nFname, nLname,imgIcon).then((doc)=>{
            console.log(doc)
        }, (err)=>{
            console.log(err)
            res.render("error.hbs")
      })
    }else{
        User.update_noImg(req.params.username, nEmail, nFname, nLname
            ).then((doc)=>{
            console.log(doc)
        }, (err)=>{
            console.log(err)
            res.render("error.hbs")
        })
    }
    res.redirect("/users/user-list/"+ req.session.username)
}


// const isDuplicateEm = function(email){
//     User.findDuplicateEmail(email).then(function(doc){
//         if(doc){
//             return true
//         }else{
//             return false
//         }
//     })
// }

// const isDuplicateUn = function(username){
//     User.get(username).then(function(doc){
//         if(doc){
//             return true
//         }else{
//             return false
//         }
//     })
// }
const send_registerpage = function(req,res){
    res.render("register.hbs",{
        rightoption1: "SIGN UP",
        url1: "/users/register",
        rightoption2: "LOG IN",
        url2: "/users/login"
    })
}
const register_user = async function(req,res){
    let imgIcon
    let nUsername = req.body.un
    let nEmail = req.body.em
    let pword = req.body.pw
    if(req.body.pw == req.body.vpw)
    {
        /*invalidator for matching email or username*/
       
        // if(isDuplicateUn(nUsername)){
        //     res.render("register.hbs",{
        //         rightoption1: "SIGN UP",
        //         url1: "/users/register",
        //         rightoption2: "LOG IN",
        //         url2: "/users/login",
        //         error: "Username is already taken. Please try again."
        //     })
        // }
        // else if(isDuplicateEm(nEmail)){
        //     res.render("register.hbs",{
        //         rightoption1: "SIGN UP",
        //         url1: "/users/register",
        //         rightoption2: "LOG IN",
        //         url2: "/users/login",
        //         error: "Email was already used to create an account. Please try again."
        //     })
        User.findDuplicate(nUsername, nEmail).then(async function(doc){
            if(doc){
                console.log("Invalidator: "+ doc)
              if(doc.username == nUsername){
                res.render("register.hbs",{
                            rightoption1: "SIGN UP",
                            url1: "/users/register",
                            rightoption2: "LOG IN",
                            url2: "/users/login",
                            error: "Username is already taken. Please try again."
                })
                }else if(doc.email == nEmail){
                        res.render("register.hbs",{
                            rightoption1: "SIGN UP",
                            url1: "/users/register",
                            rightoption2: "LOG IN",
                            url2: "/users/login",
                            error: "Email was already used to create an account. Please try again."
                        })
                }
            }else{
            if(req.file){
                imgIcon = await uploadIconGetLink(req, res)
            }
            var user = {
                username: req.body.un,
                password: crypto.createHash("md5").update(pword).digest("hex"),
                email: req.body.em,
                role: "user",
                firstname: req.body.fname,
                lastname: req.body.lname,
                usericon: imgIcon
            }
            User.create(user).then(function(doc){
                console.log("added user " + user)
                req.session.username = req.body.un
                res.redirect("/")
            },function(err){
                console.log("error in adding: "+ err)
            })
            }
        })
    }
    else{
        res.render("register.hbs",{
            rightoption1: "SIGN UP",
            url1: "/users/register",
            rightoption2: "LOG IN",
            url2: "/users/login",
            error: "Password verification incorrect. Please try again."
        })
    }
}

const send_loginpage = function(req,res){
    if (req.session.username){
        /*redirect to index if user is logged in*/
        res.redirect("/")
    }else{
        res.render("login.hbs") /*no need to render options because it is already set to sign up, log in*/
    }
}

const login_user = function(req,res){
    let lusername = req.body.un
    let lpassword = req.body.pw
    
    
    User.authenticate(lusername, lpassword).then(function(doc){
        if(doc != null){
            req.session.username = doc.username
            req.session.role = doc.role
            console.log(req.session.role)
            res.redirect('back')
        }else{
            res.render("login.hbs",{
                error:"Incorrect username and/or password. Please try again."
            })
        }
    },function(err){
        console.log(err)
        res.render("login.hbs",{
            error:"Error logging in. Please try again."
        })
    })
}

const redirect_userpage = function(req,res){
    if (req.session.username){
        res.redirect("/users/user-list/"+req.session.username)
    }else{
        res.redirect("/")
    }
}

const send_adminpage = function(req,res){
    if(req.session.username){
        if(req.session.role == "admin"){
            Website.getNameAndID().then(function(retsite){
                console.log(retsite)
                User.getNameAndID().then(function(retuser){
                    console.log(retuser)
                    User.get(req.session.username).then(function(moduser){
                    if(moduser.usericon){
                        profpic = retuser.usericon
                    }else{
                        profpic = "https://bootdey.com/img/Content/avatar/avatar7.png"
                    }
                    res.render("adminpage.hbs",{
                        rightoption1: "ACCOUNT",
                        url1: "/users/user-list/"+ req.session.username,
                        rightoption2: "LOG OUT",
                        url2: "/signout",
                        loggedin: "true",
                        modurl: "/panel/admin",
                        site: retsite,
                        profpic: profpic,
                        moduser: moduser,
                        userRole: "Admin",
                        user: retuser,
                        isAdmin: true,
                        isMod: false
                    })
                },function(err){
                    console.log(err)
                    res.render("error.hbs")
                })
            },function(err){
                console.log(err)
                res.render("error.hbs")    
            })
        },function(err){
            console.log(err)
            res.render("error.hbs")
        })
        }else if(req.session.role == "moderator"){
            Website.getNameAndID().then(function(retsite){
                console.log(retsite)
                User.get(req.session.username).then(function(moduser){
                    if(moduser.usericon){
                        profpic = moduser.usericon
                    }else{
                        profpic = "https://bootdey.com/img/Content/avatar/avatar7.png"
                    }
                    res.render("adminpage.hbs",{
                        rightoption1: "ACCOUNT",
                        url1: "/users/user-list/"+ req.session.username,
                        rightoption2: "LOG OUT",
                        url2: "/signout",
                        loggedin: "true",
                        modurl: "/panel/moderator",
                        site: retsite,
                        profpic: profpic,
                        userRole: "Moderator",
                        moduser: moduser,
                        isAdmin: false,
                        isMod: true
                    })
                },function(err){
                    console.log(err)
                    res.render("error.hbs")
                })
            },function(err){
                console.log(err)
                res.render("error.hbs")
            })
        }else{
            res.redirect("/")
        }
    }else{
        res.redirect("/")
    }
}
const send_setmoderatorpage = function(req, res){
    if(req.session.username){
        if(req.session.role == "admin"){
            User.get(req.params.username).then(function(doc){
                if(doc.role == "user"){
                    res.render("setmoderator.hbs",{
                        user: doc,
                        moderator: "promote",
                        msg: "Set this user as a Moderator?",
                        promote: "Promote to Moderator",
                        loggedin: true,
                        modurl: "/panel/admin",
                        userRole: "Admin"
                    })
                }else if(doc.role == "moderator"){
                    res.render("setmoderator.hbs",{
                        user: doc,
                        moderator: "demote",
                        msg: "Set this user as a Moderator?",
                        promote: "Demote to User",
                        loggedin: true,
                        modurl: "/panel/admin",
                        userRole: "Admin" 
                    })
                }
            })
        }
    }else{
        res.redirect("/")
    }
}

const set_moderator = function(req,res){
    if(req.session.username){
        if(req.session.role == "admin"){
            if(req.params.moderator == "promote"){
                User.setmod(req.params.username).then(function(doc){

                }, function(err){
                    console.log(err)
                    res.render("error.hbs")
                })
            }else if(req.params.moderator == "demote"){
                User.demotemod(req.params.username).then(function(doc){
                
                }, function(err){
                    console.log(err)
                    res.render("error.hbs")
                })
            }
        }
    }
        res.redirect("/")
}

module.exports = {
    load_user,
    send_editprofile,
    send_registerpage,
    register_user,
    send_loginpage,
    login_user,
    redirect_userpage,
    update_user,
    send_adminpage,
    send_setmoderatorpage,
    set_moderator,
    send_changepass,
    change_password
}