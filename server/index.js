const express=require("express");
const app=express();
const mongoose=require("mongoose");
const dotenv=require("dotenv");
dotenv.config();
const authRoute = require("./routes").auth;//key
const courseRoute = require("./routes").course;//key
const passport = require("passport");
require("./config/passport")(passport); //pass passport


mongoose
    .connect("mongodb://127.0.0.1:27017/merndb")
    .then(()=>{
        console.log("connecting to mongodb...");
    })
    .catch((e)=>{
        console.log(e);
    });

//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));//use to decode post request
app.use("/api/user",authRoute);//conn to auth.js
app.use("/api/course",
        passport.authenticate("jwt",{session:false}),
        courseRoute);


app.listen(8080,()=>{console.log("後端伺服器運行在8080");});

