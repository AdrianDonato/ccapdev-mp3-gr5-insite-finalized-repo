const mongoose = require("mongoose")

var websiteSchema = mongoose.Schema({
    websitename: String,
    websiteurl: String,
    creator: String,
    category: String,
    intro_text: String,
    website_desc: String,
    webimage: String,
    web_of_the_day: Boolean,
    feature_list: [String],
    overall_score: Number,
    avg_designscore: Number,
    avg_usabilityscore: Number,
    avg_creativityscore: Number,
    avg_contentscore: Number,
    avg_trustscore: Number,
    date_added: Date,
    tags: [String],
    reviews:[{
        date: Date,
        username: String,
        usericon: String,
        overallscore: Number,
        designscore: Number,
        usabilityscore: Number,
        creativityscore: Number,
        contentscore: Number,
        trustscore: Number,
        review: String
    }],
    reviewcount: Number,
    published: Boolean,
    icon: String,
    banner: String,
    gallery: [String],
    edit_protected: Boolean
},{
    timestamps: true
})

var Website = mongoose.model("website", websiteSchema)

exports.create = function(website){
    return new Promise(function(resolve,reject){
        console.log(website)
        var wc = new Website(website)
        
        wc.save().then(function(doc){
            console.log(doc)
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.get = function(id){
    return new Promise(function(resolve, reject){
        Website.findOne({_id: id}).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}
exports.getAll = function(){
    return new Promise(function(resolve, reject){
        Website.find({published: true}).then(function(docs){
            resolve(docs)
        }, function(err){
            reject(err)
        })
    })
}
exports.deleteWebsite = function(id){
    return new Promise(function(resolve, reject){
        Website.findOneAndDelete({_id: id}).then(function(doc){
            resolve(doc)
        }, function(err){
            reject(err)
        })
    })
}
exports.getWebsiteName = function(id){
    return new Promise(function(resolve,reject){
        Website.findOne({_id: id}).then(function(doc){
            resolve(doc)
        }, function(err){
            reject(err)
        })
    })
}
exports.getAllFiltered = function(tag, sortby, orderby){
    return new Promise(function(resolve, reject){
        if(orderby == "ascending"){
            if(tag){
                Website.find({published: true, tags: {$regex: tag, $options: "i"},
                     }).sort({[sortby] : 1}).then(function(doc){
                         resolve(doc)
                     }, function(err){
                         reject(err)
                     })
            }else{
                Website.find({published: true,}).sort({[sortby] : 1}).then(function(doc){
                         resolve(doc)
                     }, function(err){
                         reject(err)
                     })
            }
        }else if(orderby == "descending"){
            if(tag){
                Website.find({published: true, tags: {$regex: tag, $options: "i"},
                    }).sort({[sortby] : -1}).then(function(doc){
                        resolve(doc)
                    }, function(err){
                        reject(err)
                })
            }else{
                Website.find({published: true}).sort({[sortby]: -1}).then(function(doc){
                    resolve(doc)
                }, function(err){
                    reject(err)
                })
            }
        }
    })
}
exports.getNameAndID = function(){
    return new Promise(function(resolve, reject){
        Website.find({}).select('websitename published').then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.getByCategory = function(category){
    return new Promise(function(resolve, reject){
        Website.find({category: category}).then(function(docs){
            resolve(docs)
        }, function(err){
            reject(err)
        })
    })
}
exports.filterCategory = function(category, tag, sortby, orderby){
    return new Promise(function(resolve, reject){
        if(orderby == "ascending"){
            if(tag){
                Website.find({published: true, category: category, tags: {$regex: tag, $options: "i"},
                     }).sort({[sortby] : 1}).then(function(doc){
                         resolve(doc)
                     }, function(err){
                         reject(err)
                     })
            }else{
                Website.find({published: true, category: category, 
                     }).sort({[sortby] : 1}).then(function(doc){
                         resolve(doc)
                     }, function(err){
                         reject(err)
                     })
            }
        }else if(orderby == "descending"){
            if(tag){
                Website.find({published: true, category: category, tags: {$regex: tag, $options: "i"},
                    }).sort({[sortby] : -1}).then(function(doc){
                        resolve(doc)
                    }, function(err){
                        reject(err)
                })
            }else{
                Website.find({published: true, category: category, 
                }).sort({[sortby]: -1}).then(function(doc){
                    resolve(doc)
                }, function(err){
                    reject(err)
                })
            }
        }
    })
}

exports.getByCategoryPublished = function(category){
    return new Promise(function(resolve, reject){
        Website.find({category: category, published: true}).then(function(docs){
            resolve(docs)
        }, function(err){
            reject(err)
        })
    })
}

exports.searchname = function(search){
    return new Promise(function(resolve, reject){
        Website.find({$or:[{websitename: {$regex: search, $options: "i"}, published: true},
                         {tags: {$regex: search, $options: "i"}, published: true},
                         {feature_list: {$regex: search, $options: "i"}, published: true},
                         {creator: {$regex: search, $options: "i"}, published: true},
                         {category: {$regex: search, $options: "i"}, published: true} ]}).then(function(docs){
            console.log(docs)
            resolve(docs)
        },function(err){
            reject(err)
        })
    })
}
// exports.searchtags = function(search){
//     return new Promise(function(resolve, reject){
//         Website.find({tags: {$regex: search}, published: true}).then(function(docs){
//             resolve(docs)
//         },function(err){
//             reject(err)
//         })
//     })
// }
// exports.searchfeatures = function(search){
//     return new Promise(function(resolve, reject){
//         Website.find({feature_list: {$regex: search}, published: true}).then(function(docs){
//             resolve(docs)
//         },function(err){
//             reject(err)
//         })
//     })
// }
exports.loadnew = function(){
    return new Promise(function(resolve, reject){
        Website.find().sort({"_id" : -1}).limit(4).then(function(docs){
            resolve(docs)
        },function(err){
            reject(err)
        })
    })
}

exports.loadhighest = function(){
    return new Promise(function(resolve, reject){
        Website.find().sort({"overall_score": -1}).limit(4).then(function(docs){
            resolve(docs)
        },function(err){
            reject(err)
        })
    })
}

exports.loadnewpublished = function(){
    return new Promise(function(resolve, reject){
        Website.find({published: true}).sort({"_id" : -1}).limit(4).then(function(docs){
            resolve(docs)
        },function(err){
            reject(err)
        })
    })
}

exports.loadhighestpublished = function(){
    return new Promise(function(resolve, reject){
        Website.find({published: true}).sort({"overall_score": -1}).limit(4).then(function(docs){
            resolve(docs)
        },function(err){
            reject(err)
        })
    })
}

exports.loadWebOfTheDay = function(){
    return new Promise(function(resolve, reject){
        Website.findOne({web_of_the_day: true}).then(function(doc){
            resolve(doc)
        }, function(err){
            reject(err)
        })
    })
}

exports.update_website_icon = function(id, newIcon){
    return new Promise(function(resolve,reject){
        Website.findOneAndUpdate({_id: id},{
            icon: newIcon
        },{
            new: true
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.update_website_banner = function(id, newBanner){
    return new Promise(function(resolve,reject){
        Website.findOneAndUpdate({_id: id},{
            banner: newBanner
        },{
            new: true
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.update_website_gallery = function(id, newGal){
    return new Promise(function(resolve,reject){
        Website.findOneAndUpdate({_id: id},{
            gallery: newGal
        },{
            new: true
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.update_website_noImg = function(id, wname, wdesc, wccategory, wcreator, wurl, wtags, wfeatures){
    return new Promise(function(resolve, reject){
        Website.findOneAndUpdate({_id: id},
            {
                websitename: wname,
                website_desc: wdesc,
                creator: wcreator,
                category: wccategory,
                websiteurl: wurl,
                tags: wtags,
                feature_list: wfeatures
            },{
                new: true
            }).then((doc)=>{
                console.log("Updated: "+ doc)
                resolve(doc)
            },function(err){
                reject(err)
            })
    })
}
exports.addreview = function(webname, rev, os, ds, us, cr, ct, ts){
    return new Promise(function(resolve,reject){
        Website.findOneAndUpdate({websitename: webname},{
            overall_score: os,
            avg_designscore: ds,
            avg_usabilityscore: us,
            avg_creativityscore: cr,
            avg_contentscore: ct,
            avg_trustscore: ts,
            $push:{
                reviews: rev
            }, $inc:{
                reviewcount: 1
            }
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.checkifreviewed = function(uname, webid){
    console.log("working")
    return new Promise(function(resolve,reject){
        Website.findOne({
            _id: webid, 
            'reviews.username': uname
        }).then(function(doc){
            console.log("found")
            resolve(doc)
        },function(err){
            console.log("error")
            reject(err)
        })
    })
}

exports.unpublishsite = function(webid){
    return new Promise(function(resolve,reject){
        Website.findOneAndUpdate({_id: webid},{
            published: false
        },{
            new: true
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.republishsite = function(webid){
    return new Promise(function(resolve,reject){
        Website.findOneAndUpdate({_id: webid},{
            published: true
        },{
            new: true
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.getscores = function(webid, field){
    return new Promise (function(resolve,reject){
        Website.findOne({_id:webid}).select(field + ' -_id').then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.getreviews = function(webid, uname){
    return new Promise (function(resolve,reject){
        Website.findOne({_id:webid}).select('reviews -_id').then(function(revarray){
            let foundreview = revarray.reviews.find(obj => {return obj.username === uname})
            console.log("found in website js getreviews function: " + foundreview)
            resolve(foundreview)
        },function(err){
            reject(err)
        })
    })
}

exports.checkifpublished = function(webid){
    return new Promise(function(resolve,reject){
        Website.findOne({_id:webid}).select('published -_id').then(function(status){
            resolve(status)
        },function(err){
            reject(err)
        })
    })
}

exports.deletereview = function(webid, uname){
    return new Promise(function(resolve,reject){
        Website.findOneAndUpdate({_id: webid},{
            $pull:{
                reviews:{username:uname}
            }, $inc: {
                reviewcount: -1
            }
        }).then(function(doc){
            resolve(doc)
        }, function(err){
            reject(err)
        })
    })
}

exports.updatereview = function(webid, uImg, uname, os, ds, us, cr, ct, ts, rev){
    return new Promise(function(resolve,reject){
        Website.findOneAndUpdate({_id: webid, 'reviews.username': uname},{
            $set:{
                'reviews.$.usericon' : uImg,
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

exports.updatescores = function (webid, os, ds, us, cr, ct, ts){
    return new Promise(function(resolve,reject){
        Website.findOneAndUpdate({_id: webid},{
            overall_score: os,
            avg_designscore: ds,
            avg_usabilityscore: us,
            avg_creativityscore: cr,
            avg_contentscore: ct,
            avg_trustscore: ts
        },{
            new: true
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.setwebofday = function(webid){
    return new Promise(function(resolve,reject){
        Website.findOneAndUpdate({web_of_the_day: true},{
            web_of_the_day: false
        },{
            new: true
        }).then(function(doc){
            console.log("No longer web of the day")
        },function(err){
            reject(err)
        })
         
        Website.findOneAndUpdate({_id: webid},{
            web_of_the_day: true,
            published: true
        }, {
            new: true
        }).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
        
}
