const express=require('express');
const router=express.Router({mergeParams:true});
const CampGround= require('../models/campground');
const {campgroundSchema}=require('../schema');
const ExpressError=require('../utils/ExpressError')
const {isLoggedIn} = require('../middleware')
const validateCampground = (req,res,next)=>{
    const {error}=campgroundSchema.validate(req.body);
   if(error){
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg,400);
   }else{
    next();
   }
}


router.get('/', async (req,res)=>{
    const campground = await CampGround.find();
    res.render('campgrounds/index',{campground})
})

router.get('/new',isLoggedIn,(req,res)=>{    
        res.render('campgrounds/new')
})

router.post('/',isLoggedIn,validateCampground,async(req,res)=>{
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
    const campground=new CampGround(req.body.campground);
    campground.author=req.user._id;
    await campground.save();
    req.flash('success','Successfully made a new campground')
    res.redirect(`/campground/${campground.id}`)
})

router.get('/:id/edit',isLoggedIn,async (req,res)=>{
    const campground=await CampGround.findById(req.params.id);
     if(!campground){
        req.flash('error', 'Can not find that campground');
        return res.redirect('/campground')
    }8
    res.render('campgrounds/edit',{campground})
    
})

router.delete('/:id',isLoggedIn,async (req,res)=>{
    await CampGround.findByIdAndDelete(req.params.id)
    req.flash('success','Successfully deleted the campground')
    res.redirect('/campground')
    
})

router.get('/:id',isLoggedIn,async (req,res)=>{
    const id=req.params.id;
    const camp= await CampGround.findById(id).populate('reviews').populate('author')
    if(!camp){
        req.flash('error', 'Can not find that campground');
        return res.redirect('/campground')
    }
res.render('campgrounds/show',{camp})
})

router.put('/:id',isLoggedIn,validateCampground,async (req,res)=>{
   const campground = await CampGround.findByIdAndUpdate(req.params.id,{...req.body.campground})
   req.flash('success','Successfully edited the campground')
    res.redirect(`/campground/${req.params.id}`)

})


module.exports=router