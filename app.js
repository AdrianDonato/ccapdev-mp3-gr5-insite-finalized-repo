const express = require("express")
const session = require("express-session")
const bodyparser = require("body-parser")
const cookieparser = require("cookie-parser")
const mongoose = require("mongoose")
const multer = require("multer")

const app = express()

const cloudinary = require("cloudinary").v2


mongoose.connect("mongodb+srv://insite-admin:c1sc0p4ssw0rd@cluster0.t9ltc.mongodb.net/apdev-gr5-mp3?retryWrites=true&w=majority",{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

app.set("view engine", "hbs")
app.use(express.static('public'))

app.use(session({
    secret:"very secret",
    resave: false,
    saveUninitialized: true,
    cookie:{
        maxAge: 1000*60*60,
        httpOnly: true
    }
}))

app.use(require("./routes"))

app.listen(process.env.PORT || 3000)

// app.listen(3000, function(){
//     console.log("listening to port 3000")
// })
