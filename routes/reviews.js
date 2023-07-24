const express = require('express');
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {reviewSchema} = require('../schema.js');
const Review = require('../models/review');
const Car = require('../models/car');

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.post('/', validateReview, catchAsync(async(req, res)=>{
    const car = await Car.findById(req.params.id);
    const review = new Review(req.body.review);
    car.reviews.push(review);
    await review.save();
    await car.save();
    req.flash('success', 'Your Review Created !!');
    res.redirect(`/cars/${car.id}`);
}))

router.delete('/:rid', catchAsync(async(req, res) => {
    Car.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.rid}})
    await Review.findByIdAndDelete(req.params.rid)
    req.flash('success', 'Review Deleted Successfully !!');
    res.redirect(`/cars/${req.params.id}`)
}))

module.exports = router;