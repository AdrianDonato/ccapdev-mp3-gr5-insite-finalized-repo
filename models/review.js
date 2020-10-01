const mongoose = require("mongoose")


var reviewSchema  = mongoose.Schema({
   date: Date,
   username: String,
   usericon: String,
   websitename: String,
   designscore: Number,
   usabilityscore: Number,
   contentscore: Number,
   creativityscore: Number,
   trustscore: Number,
   review: String
})

var Review = mongoose.model("review", reviewSchema)

exports.create = function(review){
    return new Promise(function(resolve, reject){
        console.log(review)
        var rc = new Review(review)
        
        rc.save().then(function(doc){
            console.log(doc)
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.getWebReviews = function(webname){
    return new Promise(function(resolve,reject){
        Review.find({websitename: webname}).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}

exports.getUserReviews = function(uname){
    return new Promise(function(resolve,reject){
        Review.find({username: uname}).then(function(doc){
            resolve(doc)
        },function(err){
            reject(err)
        })
    })
}
