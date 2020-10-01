const mongoose = require("mongoose")
const crypto = require("crypto")

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String,
    role: String,
    firstname: String,
    lastname: String,
    filename : String,
    originalfilename: String,
    usericon : String,
    websitesadded:[{
        dateadded: Date,
        websitename: String,
        websiteurl: String,
        websitepageid: String
    }],
    reviews:[{
        date: Date,
        websitename: String,
        overallscore: Number,
        designscore: Number,
        usabilityscore: Number,
        creativityscore: Number,
        contentscore: Number,
        trustscore: Number,
        review: String
    }]
},{
  timestamps: true  
})

var User = mongoose.model("user", userSchema)

exports.create = function(user){
    return new Promise(function(resolve, reject){
        console.log(user)
        var uc = new User(user)
        
        uc.save().then(function(doc){
            console.log(doc)
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.authenticate = function(uname, pword){
    return new Promise(function(resolve, reject){
        User.findOne({
            username:uname,
            password:crypto.createHash("md5").update(pword).digest("hex")
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.get = function(username){
    return new Promise(function(resolve, reject){
        User.findOne({username: username}).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.findDuplicate= function(username, email){
    return new Promise(function(resolve, reject){
        User.findOne({$or: [{username: username},{email: email}]}).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.getbyid = function(id){
    return new Promise(function(resolve, reject){
        User.findOne({_id: id}).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.getNameAndID = function(){
    return new Promise(function(resolve,reject){
        User.find({}).select('username').then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.update_noImg = function(uname, email, fname, lname){
    return new Promise(function(resolve, reject){
        User.findOneAndUpdate(
            {
                username: uname
            },{
                email: email,
                firstname: fname,
                lastname: lname
               },{
                new : true
            }).then(function(doc){
            console.log("Updated: " + doc)
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.update_wImg = function(uname, email, fname, lname, userImage){
    return new Promise(function(resolve, reject){
        User.findOneAndUpdate(
            {
                username: uname
            },{
                email: email,
                firstname: fname,
                lastname: lname,
                usericon: userImage
            },{
                new : true
            }).then(function(doc){
            console.log(doc)
            resolve("Updated: " + doc)
        },function(err){
            reject(err)
        })
    })
}
exports.update_password = function(username, oldpass, npass){
    return new Promise(function(resolve, reject){
        User.findOneAndUpdate({
            username: username,
            password:crypto.createHash("md5").update(oldpass).digest("hex")
        },  {
            password:  crypto.createHash("md5").update(npass).digest("hex")
            },{
            new: true
            }).then(function(doc){
                resolve(doc)
            },function(err){
                reject(err)
            })
    })
}

exports.setmod = function(uname){
    return new Promise(function(resolve,reject){
        User.findOneAndUpdate({username: uname},{
            role: "moderator"
        },{
            new: true
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.demotemod = function(uname){
    return new Promise(function(resolve,reject){
        User.findOneAndUpdate({username: uname},{
            role: "user"
        },{
            new: true
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.addreview = function(uname, rev){
    return new Promise(function(resolve,reject){
        User.findOneAndUpdate({username: uname},{
            $push:{
                reviews: rev
            }
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.updatereview = function(webname, uname, os, ds, us, cr, ct, ts, rev){
    return new Promise(function(resolve,reject){
        User.findOneAndUpdate({username: uname, 'reviews.websitename': webname},{
            $set:{
                'reviews.$.overallscore': os,
                'reviews.$.designscore': ds,
                'reviews.$.usabilityscore': us,
                'reviews.$.creativityscore': cr,
                'reviews.$.contentscore': ct,
                'reviews.$.trustscore': ts,
                'reviews.$.review': rev
            }
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.addwebsite = function(uname, web){
    return new Promise(function(resolve,reject){
        User.findOneAndUpdate({username: uname},{
            $push:{
                websitesadded: web
            }
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.deletereview = function(uname, webname){
    return new Promise(function(resolve,reject){
        User.findOneAndUpdate({username: uname},{
            $pull:{
                reviews:{websitename:webname}
            }
        }).then(function(doc){
            resolve(doc)
        }, function(err){
            reject(err)
        })
    })
}