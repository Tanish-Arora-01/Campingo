const express=require('express');
const router=express.Router({mergeParams:true });
const Review = require('../models/review');
const CampGround= require('../models/campground');
const ExpressError=require('../utils/ExpressError')
const {reviewSchema}=require('../schema');
const { isLoggedIn } = require('../middleware');
const validateReview = (req,res,next)=>{
    const {error}=reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

router.post('/', isLoggedIn,validateReview,async (req,res)=>{
   const campground = await CampGround.findById(req.params.id);
   const review=new Review(req.body.review);
   campground.reviews.push(review);
   await review.save();
   await campground.save();
   req.flash('success','Successfully posted a new review')
   res.redirect(`/campground/${campground.id}`);
})

router.delete('/:reviewId',isLoggedIn,async(req,res)=>{
    const {id,reviewId} = req.params;
   await CampGround.findByIdAndUpdate(id,{$pull : {reviews : reviewId}});
    await Review.findByIdAndDelete(req.params.reviewId);
    req.flash('success','Successfully deleted the review')
    res.redirect(`/campground/${req.params.id}`);
})




module.exports=router;