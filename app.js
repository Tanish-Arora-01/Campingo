const express = require ('express');
const app=express();
const path =require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ExpressError=require('./utils/ExpressError')
const db = mongoose.connection;
const User=require('./models/user');
const ejsMate=require('ejs-mate');
const Campground = require('./routes/campground');
const reviews=require('./routes/reviews');
const session = require('express-session')
const flash=require('connect-flash');
const passport=require('passport');
const localStrategy=require('passport-local')

const userRoutes=require("./routes/users");

const sessionConfig = {
    secret: ' thisshouldbeabettersecret',
    resave:false,
    saveUninitialized:true,
    cookie:{
        httpOnly:true,
        expires: Date.now() +1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
}

app.use(session(sessionConfig))
app.use(flash());
app.use(express.json());
mongoose.connect('mongodb://localhost:27017/go-camp')
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')))
app.engine('ejs',ejsMate);
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());





app.use((req,res,next)=>{
    res.locals.currentUser=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    next();
})

app.set('view engine', 'ejs' );
app.set('views',path.join(__dirname,'views'));
db.on("error", console.error.bind(console,"connection error"));
db.once("open", ()=>{
    console.log("Database connected");
})

app.use("/campground/:id/reviews",reviews);
app.use("/campground",Campground)
app.use('/',userRoutes);
app.all(/(.*)/,(req,res,next)=>{
    next(new ExpressError('Page Not Found',404));
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something Went Wrong' } = err;
     res.status(statusCode).render('error', { statusCode, message });
  

});

app.listen(3000, ()=>{
    console.log("Serving on port 3000!")
})
