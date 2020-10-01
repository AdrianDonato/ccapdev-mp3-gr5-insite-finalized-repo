const express = require("express")
const bodyparser = require("body-parser")
const Website = require("../models/website.js")
const User = require("../models/user.js")
const multer = require("multer")
const fs = require("fs")
const path = require("path")
const mongoose = require("mongoose")
const e = require("express")
const cloudinary = require("cloudinary").v2

const UPLOAD_PATH = path.resolve("public", "uploads")
const upload = multer({
  dest: UPLOAD_PATH,
  limits: {
    fileSize : 10000000,
    files : 4
  }
})

cloudinary.config({
    cloud_name: 'dsuuwylaw',
    api_key: '476193259459543',
    api_secret: 'TcvSUQstCxTBVO2XOIxrba-QL4s'
})

function checkReviewStatus(username, websiteid){
    return new Promise(resolve=>{
        let revstatus = false
        Website.checkifreviewed(username, websiteid).then(function(doc){
            if(doc != null){
                revstatus = true
            }
            console.log("review function: " + revstatus)
            resolve(revstatus);
        },function(err){
            console.log(err)
        })  
    })
}

function getScores(webid, field){
    return new Promise(resolve=>{
        Website.getscores(webid, field).then(function(doc){
            resolve(doc)
        },function(err){
            console.log(err)
        })
    },function(err){
        console.log(err)
    })
}

function getReview(webid, uname){
    return new Promise(resolve=>{
        Website.getreviews(webid, uname).then(function(doc){
            resolve(doc)
        },function(err){
            console.log(err)
        })
    },function(err){
        console.log(err)
    })
}

function getPublishStatus(webid){
    return new Promise(resolve=>{
        Website.checkifpublished(webid).then(function(doc){
            resolve(doc.published)
        },function(err){
            reject(err)
        })
    })
}

const load_website = async function(req,res){
    /* 
        1. load website details
        2. load website reviews
    */
    let webid = req.params.websiteid
    let gotreview = await getReview(webid, req.session.username)
    let revstatus = await checkReviewStatus(req.session.username, webid)
    let osobject = await getScores(webid, 'reviews.overallscore')
    let osarray = osobject.reviews.map(function(element){
        return element.overallscore
    })
    let publishstatus = await getPublishStatus(webid)
    
    console.log("overall scores: " + osarray)
    console.log("review status: " + revstatus)
    console.log("Successfully loaded website")
    Website.get(webid).then(function(doc){
         if(publishstatus == true || req.session.role == "admin" || req.session.role == "moderator"){
             if (req.session.username){

                let editstatus = false
                let adminstatus = false
                let modstatus = false
                let moderatorurl = null
                let userRole = "User"

                if(req.session.role == "admin" || req.session.role == "moderator"){
                    editstatus = true
                    if(req.session.role == "admin"){
                        editstatus = true
                        moderatorurl = "/panel/admin"
                        adminstatus = true
                        userRole = "Admin"
                    }
                    else if( req.session.role == "moderator") {
                        editstatus = true
                        modstatus = true
                        moderatorurl = "/panel/moderator"
                        userRole = "Moderator"
                    }
                } 
                if(req.session.username == doc.creator && doc.edit_protected == false){
                    editstatus = true
                    userRole = "Creator"
                }
                console.log("editable: " + editstatus)

                if(revstatus == true)
                    {
                        res.render("websitepage.hbs",{
                            loggedin: true,
                            rightoption1: "ACCOUNT",
                            url1: ("/users/user-list/"+req.session.username),
                            rightoption2: "LOG OUT",
                            url2: "/signout",
                            site: doc,
                            editreview: true,
                            editable: editstatus,
                            adminstatus: adminstatus,
                            userRole: userRole,
                            modstatus: modstatus,
                            modurl: moderatorurl,
                            ownreview: gotreview
                        })
                    }
                 else{
                     res.render("websitepage.hbs",{
                            loggedin: true,
                            rightoption1: "ACCOUNT",
                            url1: ("/users/user-list/"+req.session.username),
                            rightoption2: "LOG OUT",
                            url2: "/signout",
                            site: doc,
                            editable: editstatus,
                            userRole: userRole,
                            adminstatus: adminstatus,
                            modstatus: modstatus,
                            modurl: moderatorurl
                        })
                 }
            }
            else{
                res.render("websitepage.hbs",{
                    rightoption1: "SIGN UP",
                    url1: "/users/register",
                    rightoption2: "LOG IN",
                    url2: "/users/login",
                    site: doc
                })
            }
        }else{
            res.redirect("/")
        }
        console.log("Loaded Website: "+ doc)
        console.log("TAGS: "+ doc.tags)
    }, function(err){
        console.log(err)
    })
    
}


const send_submitsitepage = function(req,res){
    if (req.session.username){
        let moderatorurl = null
        let userRole = "User"
        if(req.session.role == "admin"){
            userRole = "Admin"
            moderatorurl = "/panel/admin"
        }else if(req.session.role == "moderator"){
            userRole = "Moderator"
            moderatorurl = "/users/panel/moderator"
        } 
        res.render("submitsite.hbs",{
            rightoption1: "ACCOUNT",
            url1: ("/users/user-list/"+req.session.username),
            rightoption2: "LOG OUT",
            url2: "/signout",
            loggedin: true,
            modurl: moderatorurl,
            userRole: userRole
        })
    }else{
        res.render("login.hbs",{
            rightoption1: "SIGN UP",
            url1: "/users/register",
            rightoption2: "LOG IN",
            url2: "/users/login"
        })
    }
}

function uploadIconGetLink(req,res){
    return new Promise(resolve=>{
        cloudinary.uploader.upload(req.files["webImg"][0].path).then(function(iconlink){
            resolve(iconlink.url)
        },function(err){
            console.log(err)
        })
    },function(err){
        console.log(err)
    })
}

function uploadBannerGetLink(req,res){
    return new Promise(resolve=>{
        cloudinary.uploader.upload(req.files["webBanner"][0].path).then(function(iconlink){
            resolve(iconlink.url)
        },function(err){
            console.log(err)
        })
    },function(err){
        console.log(err)
    })
}

const submit_website = async function(req,res){
    let imgIcon
    let imgBanner
    let imgsURL
    let galleryPaths = []
    
    for (let j = 0; j < req.files["imgsGal"].length; j++){
        galleryPaths.push(req.files["imgsGal"][j].path)
    }
    
    let creatorname
    let protected = true
    
    if(req.body.useriscreator){
        creatorname = req.session.username
        protected = false
    }else{
        creatorname = req.body.creator
    }
    
    let uploadGalleryGetLinks = new Promise(async (resolve,reject)=>{    
            let urlArray =[]
            console.log("PATH: " + req.files["imgsGal"][0].path)
            console.log(req.files["imgsGal"])
            for(let i = 0; i < galleryPaths.length + 1; i++){
                let filepath = galleryPaths[i]

                await cloudinary.uploader.upload(filepath,function(error, result){
                    console.log(result)
                    if(urlArray.length == galleryPaths.length){
                        resolve(urlArray)
                    }else if (result){
                        urlArray.push(result.url)
                    }else if (error){
                        console.log(error)
                        reject(error)
                    }
                })
            }

        }).then((finalresult)=>finalresult).catch((error)=>(error))
    
    if(req.files){
        imgIcon = await uploadIconGetLink(req,res)
        imgBanner = await uploadBannerGetLink(req,res)
        imgsURL = await uploadGalleryGetLinks
    }
    
    let newsite = {
            websitename: req.body.site,
            websiteurl: req.body.link,
            creator: creatorname,
            category: req.body.category,
            website_desc: req.body.desc,
            web_of_the_day: false,
            feature_list: req.body.featurelist.split(","),
            tags: req.body.tags.split(","),
            overall_score: 0,
            avg_designscore: 0,
            avg_usabilityscore: 0,
            avg_contentscore: 0,
            avg_creativityscore: 0,
            avg_trustscore: 0,
            reviewcount: 0,
            published: true,
            icon: imgIcon,
            banner: imgBanner,
            gallery: imgsURL,
            edit_protected: protected
    }
    Website.create(newsite).then(function(doc){
        let useraddedsite = {
            dateadded: new Date(Date.now()),
            websitename: req.body.site,
            websiteurl: doc._id
        }
        User.addwebsite(req.session.username, useraddedsite).then(function(doc){
          res.redirect("/")  
        },function(err){
            console.log(err)
        })
    },function(err){
        console.log(err)
    })
}

const load_newly_added = function(req,res){
    let currDate = new Date().toJSON().split("T")[0]
    
    if(req.session.username){
        let moderatorurl = null
        let userRole = "User"
        if(req.session.role == "admin"){
            userRole = "Admin"
            moderatorurl = "/panel/admin"
        }else if(req.session.role == "moderator"){
            userRole = "Moderator"
            moderatorurl = "/panel/moderator"
        } 
            Website.loadhighestpublished().then((highest)=>{
                Website.loadnewpublished().then((latest)=>{
                    Website.loadWebOfTheDay().then((weboftheday)=>{
                        res.render("index.hbs",{
                            loggedin: true,
                            rightoption1: "ACCOUNT",
                            url1: ("/users/user-list/"+req.session.username),
                            rightoption2: "LOG OUT",
                            url2: "/signout",
                            modurl: moderatorurl,
                            userRole: userRole,
                            newwebsites: latest,
                            topwebsites: highest,
                            weboftheday: weboftheday,
                            currentdate: currDate
                        }) 
                    },(err)=>{
                        console.log(err)
                        res.render("error.hbs")
                    })
                },(err)=>{
                    console.log(err)
                    res.render("error.hbs")
                })
            },(err)=>{
                console.log(err)
                res.render("error.hbs")
            })
    }else{
        Website.loadhighestpublished().then((highest)=>{
            Website.loadnewpublished().then((latest)=>{
                Website.loadWebOfTheDay().then((weboftheday)=>{
                    res.render("index.hbs",{
                        rightoption1: "SIGN UP",
                        url1: "/users/register",
                        rightoption2: "LOG IN",
                        url2: "/users/login",
                        newwebsites: latest,
                        topwebsites: highest,
                        weboftheday: weboftheday,
                        currentdate: currDate.toString()
                    })
                },(err)=>{
                    console.log(err)
                    res.render("error.hbs")
                })
            },(err)=>{
                console.log(err)
                res.render("error.hbs")
            })
        },(err)=>{
            console.log(err)
            res.render("error.hbs")
        })
    }
}

const send_reviewpage = function(req,res){
    let webid = req.params.websiteid
    if(req.session.username){
        let moderatorurl = null
        let userRole = "User"
        if(req.session.role == "admin"){
            userRole = "Admin"
            moderatorurl = "/panel/admin"
        }else if(req.session.role == "moderator"){
            userRole = "Moderator"
            moderatorurl = "/panel/moderator"
        } 
        Website.get(webid).then(function(docs){
            res.render("review.hbs",{
                site: docs,
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                loggedin: true,
                modurl: moderatorurl,
                userRole: userRole
            }),function(err){
                console.log(err)
                res.render("error.hbs")
            }  
        })
    }else{
        res.redirect("/users/login")
    }
}

const search_results = function(req, res){
    let search = req.query.search
    console.log(req.query.search)
    Website.searchname(search).then(function(nameresult){
        if(req.session.username){
            let moderatorurl = null
            let userRole = "User"
            if(req.session.role == "admin"){
                userRole = "Admin"
                moderatorurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                moderatorurl = "/users/panel/moderator"
            } 
            res.render("search.hbs",{
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                loggedin: "true",
                search: search,
                nameresult: nameresult,
                modurl: moderatorurl,
                userRole: userRole
            })
        }   
        else{
            res.render("search.hbs",{
                rightoption1: "SIGN UP",
                url1: "/users/register",
                rightoption2: "LOG IN",
                url2: "/users/login",
                search: search,
                nameresult: nameresult,
                      
                    })
                }
            })
  
}



const submit_review = async function(req,res){
    console.log(req.body.design)
    console.log(req.body)
    let userImg
    let webid = req.params.websiteid
    //get objects from database then convert to array
    let currOSobj = await getScores(webid, 'reviews.overallscore')
    let currOSarr = currOSobj.reviews.map(function(element){
        return element.overallscore
    })
    let currDSobj = await getScores(webid, 'reviews.designscore')
    let currDSarr = currDSobj.reviews.map(function(element){
        return element.designscore
    })
    let currUSobj = await getScores(webid, 'reviews.usabilityscore')
    let currUSarr = currUSobj.reviews.map(function(element){
        return element.usabilityscore
    })
    let currCRobj = await getScores(webid, 'reviews.creativityscore')
    let currCRarr = currCRobj.reviews.map(function(element){
        return element.creativityscore
    })
    let currCTobj = await getScores(webid, 'reviews.contentscore')
    let currCTarr = currCTobj.reviews.map(function(element){
        return element.contentscore
    })
    let currTSobj = await getScores(webid, 'reviews.trustscore')
    let currTSarr = currTSobj.reviews.map(function(element){
        return element.trustscore
    })
    //get overall score of submitted review
    let overall = ((Number(req.body.design) + Number(req.body.usability) + Number(req.body.creativity) + 
                    Number(req.body.content) + Number(req.body.trust))/5)
    //push scores of submitted review to array of current review scores
    currOSarr.push(overall)
    currDSarr.push(req.body.design)
    currUSarr.push(req.body.usability)
    currCRarr.push(req.body.creativity)
    currCTarr.push(req.body.content)
    currTSarr.push(req.body.trust)
    //convert array contents into numbers
    currOSarr = currOSarr.map(Number)
    currDSarr = currDSarr.map(Number)
    currUSarr = currUSarr.map(Number)
    currCRarr = currCRarr.map(Number)
    currCTarr = currCTarr.map(Number)
    currTSarr = currTSarr.map(Number)
    //get average of arrays
    newAvgOS = (currOSarr.reduce((prev,curr)=>curr+=prev))/currOSarr.length
    newAvgDS = (currDSarr.reduce((prev,curr)=>curr+=prev))/currDSarr.length
    newAvgUS = (currUSarr.reduce((prev,curr)=>curr+=prev))/currUSarr.length
    newAvgCR = (currCRarr.reduce((prev,curr)=>curr+=prev))/currCRarr.length
    newAvgCT = (currCTarr.reduce((prev,curr)=>curr+=prev))/currCTarr.length
    newAvgTS = (currTSarr.reduce((prev,curr)=>curr+=prev))/currTSarr.length
    
    console.log(overall)
    console.log(req.body.websitename)
    User.get(req.session.username).then((doc)=>{
        userImg = doc.usericon
        console.log("Retrieved User: " + doc)
        console.log("USERICON: " + userImg)
        
        let newreview = {
            date: Date.now(),
            username: req.session.username,
            usericon: userImg,
            websitename: req.body.websitename,
            overallscore: overall,
            designscore: req.body.design,
            usabilityscore: req.body.usability,
            creativityscore: req.body.creativity,
            contentscore: req.body.content,
            trustscore: req.body.trust,
            review: req.body.reviewcontent
        }
        console.log("new average: " + newAvgOS)
        console.log("creativity avg: " +newAvgCR)
        console.log("creativity array: "+currCTarr)
        Website.addreview(req.body.websitename, newreview, newAvgOS, newAvgDS, newAvgUS, newAvgCR, newAvgCT, newAvgTS).then(function(doc){
            User.addreview(req.session.username, newreview).then(function(doc){
              res.redirect(("/websites/websitelist/"+webid))  
            },function(err){
                console.log(err)
                res.render("error.hbs")
            })
        },function(err){
            console.log(err)
            res.render("error.hbs")
        })
    }, function(err){
        console.log(err)
        res.render("error.hbs")
    })
    
}

const send_editreview = async function(req,res){
    let webid = req.params.websiteid
    
    let userreview = await getReview(webid, req.session.username)
    if(req.session.username){
        let moderatorurl = null
        let userRole = "User"
        if(req.session.role == "admin"){
            userRole = "Admin"
            moderatorurl = "/panel/admin"
        }else if(req.session.role == "moderator"){
            userRole = "Moderator"
            moderatorurl = "/users/panel/moderator"
        } 
        Website.get(webid).then(function(docs){
            res.render("editreview.hbs",{
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                modurl: moderatorurl,
                userRole: userRole,
                loggedin: true,
                site: docs,
                editreview: userreview
            }),function(err){
                console.log(err)
                res.render("error.hbs")
            }  
        })
    }else{
        res.redirect("/users/login")
    }
}

function getSiteName(webid){
    return new Promise(resolve=>{
        Website.get(webid).then(function(foundsite){
            resolve(foundsite.websitename)
        },function(err){
            console.log(err)
        })
    })
}

const send_deletereview = async function(req,res){
    let webid = req.params.websiteid
    let moderatorurl = null
        let userRole = "User"
        if(req.session.role == "admin"){
            userRole = "Admin"
            moderatorurl = "/panel/admin"
        }else if(req.session.role == "moderator"){
            userRole = "Moderator"
            moderatorurl = "/panel/moderator"
        }
    if(req.session.username == req.params.username || req.session.role == "admin" || req.session.role == "moderator")
    {
        let deletereview = await getReview(webid, req.params.username)
        Website.get(webid).then(function(doc){
          res.render("deletereview.hbs",{
                rightoption1: "ACCOUNT",
                url1: ("/users/user-list/"+req.session.username),
                rightoption2: "LOG OUT",
                url2: "/signout",
                modurl: moderatorurl,
                userRole: userRole,
                loggedin: true,
                delreview: deletereview,
                webdelete: doc
            })  
        })
    }else{
        res.redirect("/websitelist/"+webid)
    }
}

const update_review = async function(req,res){
    let webid = req.params.websiteid
    let username = req.session.username
    let design = req.body.design
    let usability = req.body.usability
    let creativity = req.body.creativity 
    let content = req.body.content 
    let trust = req.body.trust 
    let overall = ((Number(req.body.design) + Number(req.body.usability) + Number(req.body.creativity) + 
                    Number(req.body.content) + Number(req.body.trust))/5)
    let newrev = req.body.reviewcontent
    let userImg
    
    User.get(req.session.username).then((doc)=>{
        userImg = doc.usericon
        Website.updatereview(webid, userImg, username, overall, design, usability, creativity, content, trust, newrev).then(function(doc){
            /*update user part of review*/
            User.updatereview(req.body.websitename, username, overall, design, usability, creativity, content, trust, newrev).then(async function(doc){
                let currOSobj = await getScores(webid, 'reviews.overallscore')
                let currOSarr = currOSobj.reviews.map(function(element){
                    return element.overallscore
                })
                let currDSobj = await getScores(webid, 'reviews.designscore')
                let currDSarr = currDSobj.reviews.map(function(element){
                    return element.designscore
                })
                let currUSobj = await getScores(webid, 'reviews.usabilityscore')
                let currUSarr = currUSobj.reviews.map(function(element){
                    return element.usabilityscore
                })
                let currCRobj = await getScores(webid, 'reviews.creativityscore')
                let currCRarr = currCRobj.reviews.map(function(element){
                    return element.creativityscore
                })
                let currCTobj = await getScores(webid, 'reviews.contentscore')
                let currCTarr = currCTobj.reviews.map(function(element){
                    return element.contentscore
                })
                let currTSobj = await getScores(webid, 'reviews.trustscore')
                let currTSarr = currTSobj.reviews.map(function(element){
                    return element.trustscore
                })
                //convert array contents into numbers
                currOSarr = currOSarr.map(Number)
                currDSarr = currDSarr.map(Number)
                currUSarr = currUSarr.map(Number)
                currCRarr = currCRarr.map(Number)
                currCTarr = currCTarr.map(Number)
                currTSarr = currTSarr.map(Number)
                //get average of arrays
                newAvgOS = (currOSarr.reduce((prev,curr)=>curr+=prev))/currOSarr.length
                newAvgDS = (currDSarr.reduce((prev,curr)=>curr+=prev))/currDSarr.length
                newAvgUS = (currUSarr.reduce((prev,curr)=>curr+=prev))/currUSarr.length
                newAvgCR = (currCRarr.reduce((prev,curr)=>curr+=prev))/currCRarr.length
                newAvgCT = (currCTarr.reduce((prev,curr)=>curr+=prev))/currCTarr.length
                newAvgTS = (currTSarr.reduce((prev,curr)=>curr+=prev))/currTSarr.length
                Website.updatescores(webid, newAvgOS, newAvgDS, newAvgUS, newAvgCR, newAvgCT, newAvgTS).then(function(doc){
                  res.redirect(("/websites/websitelist/"+webid))  
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
    })
    
}



const delete_review = function(req,res){
    let webid = req.params.websiteid
    let username = req.params.username
    let websitename = req.body.websitename
        Website.deletereview(webid, username).then(function(doc){
            /*delete user part of review*/
            User.deletereview(username, websitename).then(async function(doc){
                /*update average scores*/
                let currOSobj = await getScores(webid, 'reviews.overallscore')
                let currOSarr = currOSobj.reviews.map(function(element){
                    return element.overallscore
                })
                let currDSobj = await getScores(webid, 'reviews.designscore')
                let currDSarr = currDSobj.reviews.map(function(element){
                    return element.designscore
                })
                let currUSobj = await getScores(webid, 'reviews.usabilityscore')
                let currUSarr = currUSobj.reviews.map(function(element){
                    return element.usabilityscore
                })
                let currCRobj = await getScores(webid, 'reviews.creativityscore')
                let currCRarr = currCRobj.reviews.map(function(element){
                    return element.creativityscore
                })
                let currCTobj = await getScores(webid, 'reviews.contentscore')
                let currCTarr = currCTobj.reviews.map(function(element){
                    return element.contentscore
                })
                let currTSobj = await getScores(webid, 'reviews.trustscore')
                let currTSarr = currTSobj.reviews.map(function(element){
                    return element.trustscore
                })
                //convert array contents into numbers
                currOSarr = currOSarr.map(Number)
                currDSarr = currDSarr.map(Number)
                currUSarr = currUSarr.map(Number)
                currCRarr = currCRarr.map(Number)
                currCTarr = currCTarr.map(Number)
                currTSarr = currTSarr.map(Number)
                //get average of arrays
                newAvgOS = (currOSarr.reduce((prev,curr)=>curr+=prev))/currOSarr.length
                newAvgDS = (currDSarr.reduce((prev,curr)=>curr+=prev))/currDSarr.length
                newAvgUS = (currUSarr.reduce((prev,curr)=>curr+=prev))/currUSarr.length
                newAvgCR = (currCRarr.reduce((prev,curr)=>curr+=prev))/currCRarr.length
                newAvgCT = (currCTarr.reduce((prev,curr)=>curr+=prev))/currCTarr.length
                newAvgTS = (currTSarr.reduce((prev,curr)=>curr+=prev))/currTSarr.length
                Website.updatescores(webid, newAvgOS, newAvgDS, newAvgUS, newAvgCR, newAvgCT, newAvgTS).then(function(doc){
                  res.redirect(("/websites/websitelist/"+webid))  
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
}



const send_editwebsite = function(req,res){
    Website.get(req.params.websiteid).then((doc)=>{
        if (req.session.username){
            let moderatorurl = null
            let userRole = "User"
            if(req.session.role == "admin"){
                userRole = "Admin"
                moderatorurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                moderatorurl = "/users/panel/moderator"
            } 
                res.render("editwebsite.hbs",{
                    rightoption1: "ACCOUNT",
                    url1: ("/users/user-list/"+req.session.username),
                    rightoption2: "LOG OUT",
                    url2: "/signout",
                    modurl: moderatorurl,
                    userRole: userRole,
                    loggedin: true,
                    website: doc
                })
        }else{
            res.redirect("/users/login")
        }
    })
}

function updateWebsiteIcon(webid, iconlink){
    return new Promise(resolve=>{
        Website.update_website_icon(webid, iconlink).then(function(doc){
            resolve(doc)
        },function(err){
            cnosole.log(err)
        })
    })
        
}

function updateWebsiteBanner(webid, banner){
    return new Promise(resolve=>{
        Website.update_website_banner(webid, banner).then(function(doc){
            resolve(doc)
        },function(err){
            cnosole.log(err)
        })
    })
}

function updateWebsiteGallery(webid, gallery){
    return new Promise(resolve=>{
        Website.update_website_gallery(webid, gallery).then(function(doc){
            resolve(doc)
        },function(err){
            cnosole.log(err)
        })
    })
}

const update_website = async function(req,res){
    
    let webid = req.params.websiteid
    let wname = req.body.site
    let wdesc = req.body.desc
    let wccategory = req.body.category
    let wcreator = req.body.creator
    let wtags = req.body.tags.split(",")
    let wfeatures = req.body.featurelist.split(",")
    let wurl = req.body.link
  
    let imgIcon
    let imgBanner

    let imgsURL
    let galleryPaths = []
    let imgIconFinal
    let imgBanFinal
    let imgGalFinal
     
    if (req.files["imgsGal"])
    {
        for (let j = 0; j < req.files["imgsGal"].length; j++){
        galleryPaths.push(req.files["imgsGal"][j].path)
        }
    }
    
    
    let uploadGalleryGetLinks = new Promise(async (resolve,reject)=>{    
            let urlArray =[]
            console.log("PATH: " + req.files["imgsGal"][0].path)
            console.log(req.files["imgsGal"])
            for(let i = 0; i < galleryPaths.length + 1; i++){
                let filepath = galleryPaths[i]

                await cloudinary.uploader.upload(filepath,function(error, result){
                    console.log(result)
                    if(urlArray.length == galleryPaths.length){
                        resolve(urlArray)
                    }else if (result){
                        urlArray.push(result.url)
                    }else if (error){
                        console.log(error)
                        reject(error)
                    }
                })
            }

        }).then((finalresult)=>finalresult).catch((error)=>(error))

        
        if(req.files["webImg"]){
            imgIcon = await uploadIconGetLink(req,res)
            imgIconFinal = await updateWebsiteIcon(webid, imgIcon)
        }
        
        if(req.files["webBanner"]){
            imgBanner = await uploadBannerGetLink(req,res)
            imgBanFinal = await updateWebsiteBanner(webid, imgBanner)
        }
        
        if(req.files["imgsGal"]){
            imgsURL = await uploadGalleryGetLinks
            imgGalFinal = await updateWebsiteGallery(webid, imgsURL)    
        }
 
        Website.update_website_noImg(webid, wname, wdesc, wccategory, wcreator, wurl, wtags, wfeatures).then((doc)=>{
            console.log("Update successful")
        }, (err)=>{
            console.log(err)
            res.render("error.hbs")
        })
    
    res.redirect("/")
}

const send_unpublishpage = function(req,res){
    if(req.session.username){
        if(req.session.role == "admin" || req.session.role == "moderator"){
            let moderatorurl = null
            let userRole = "User"
            if(req.session.role == "admin"){
                userRole = "Admin"
                moderatorurl = "/panel/admin"
            }else if(req.session.role == "moderator"){
                userRole = "Moderator"
                moderatorurl = "/users/panel/moderator"
            } 
            Website.get(req.params.id).then(function(doc){
            if(req.params.publish == "unpublish"){
                res.render("unpublish.hbs", {
                    rightoption1: "ACCOUNT",
                    url1: ("/users/user-list/"+req.session.username),
                    rightoption2: "LOG OUT",
                    url2: "/signout",
                    msg: "Unpublish",
                    publish: "unpublish",
                    site: doc,
                    loggedin: true,
                    modurl: moderatorurl,
                    userRole: userRole
                })
            }else if(req.params.publish == "republish"){
                res.render("unpublish.hbs", {
                    rightoption1: "ACCOUNT",
                    url1: ("/users/user-list/"+req.session.username),
                    rightoption2: "LOG OUT",
                    url2: "/signout",
                    msg: "Republish",
                    publish: "republish",
                    site: doc,
                    loggedin: true,
                    modurl: moderatorurl,
                    userRole: userRole
                })
            }
            })
        }else{
            res.redirect("/")
        }
    }else{
        res.redirect("/")
    } 
}


const unpublishpage = function(req, res){
    if(req.session.username){
        if(req.session.role == "admin" || req.session.role == "moderator"){
            if(req.params.publish == "unpublish"){
                Website.unpublishsite(req.params.id).then(function(doc){
                    console.log("Unpublished page")
                }, function(err){
                    console.log(err)
                    res.render("error.hbs")
                })
            }else if(req.params.publish == "republish"){
                Website.republishsite(req.params.id).then(function(doc){
                    console.log("Republished page")
                }, function(err){
                    console.log(err)
                    res.render("error.hbs")
                })
            }
        }
    }
    res.redirect("/")
}
const send_weboftheday = function(req, res){
    Website.get(req.params.id).then(function(doc){
        if (req.session.username){
            let moderatorurl = null
           let userRole = "User"
        if(req.session.role == "admin"){
            userRole = "Admin"
            moderatorurl = "/panel/admin"
                   res.render("weboftheday.hbs",{
                       loggedin: true,
                       rightoption1: "ACCOUNT",
                       url1: ("/users/user-list/"+req.session.username),
                       rightoption2: "LOG OUT",
                       url2: "/signout",
                       site: doc,
                       userRole: userRole,
                       modurl: moderatorurl
                   })
               }
            else{
                res.render("weboftheday.hbs",{
                       loggedin: true,
                       rightoption1: "ACCOUNT",
                       url1: ("/users/user-list/"+req.session.username),
                       rightoption2: "LOG OUT",
                       url2: "/signout",
                       site: doc,
                       userRole: userRole,
                       modurl: moderatorurl
                })
            }
       }else{
           res.redirect("/users/login")
       }
       console.log("Loaded Website: "+ doc)
       console.log("TAGS: "+ doc.tags)
   }, function(err){
       console.log(err)
        res.render("error.hbs")
   })
}

const set_weboftheday = function(req, res){
    Website.setwebofday(req.params.id).then(function(doc){
        
    }, function(err){
        console.log(err)
        res.render("error.hbs")
    })

    res.redirect("/")
}

const send_deletepage = function(req, res){
    Website.get(req.params.id).then(function(doc){
        if (req.session.username){
            let moderatorurl = null
           let userRole = "User"
            if(req.session.role == "admin"){
                userRole = "Admin"
                moderatorurl = "/panel/admin"
                   res.render("deletewebsite.hbs",{
                       loggedin: true,
                       rightoption1: "ACCOUNT",
                       url1: ("/users/user-list/"+req.session.username),
                       rightoption2: "LOG OUT",
                       url2: "/signout",
                       site: doc,
                       msg: "Delete",
                       userRole: userRole,
                       modurl: moderatorurl
                   })
            }
       }else{
           res.redirect("/users/login")
       }
       console.log("Loaded Website: "+ doc)
       console.log("TAGS: "+ doc.tags)
   }, function(err){
       console.log(err)
        res.render("error.hbs")
   })
}

const delete_website = function(req, res){
    if(req.session.username){
        if(req.session.role == "admin" ){
             Website.deleteWebsite(req.params.id).then(function(doc){
                    console.log("Deleted website")
                }, function(err){
                    console.log(err)
                    res.render("error.hbs")
                })
        }
    }
    res.redirect("/")
}

module.exports = {
    load_website,
    send_submitsitepage,
    submit_website,
    load_newly_added,
    send_reviewpage,
    submit_review,
    search_results,
    send_editreview,
    update_review,
    send_editwebsite,
    update_website,
    send_unpublishpage,
    unpublishpage,
    send_weboftheday,
    set_weboftheday,
    send_deletepage,
    delete_website,
    send_deletereview,
    delete_review
}