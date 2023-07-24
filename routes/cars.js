const express = require('express');
const router = express.Router({mergeParams:true});
const Car = require('../models/car');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const {carSchema} = require('../schema.js');
const {isLoggedIn} = require('../middleware');

const validateCar = (req, res, next) => {
    const {error} = carSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(",")
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const cars = await Car.find({});
    res.render('cars/index', { cars });
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('cars/new');
})

router.post('/', isLoggedIn, validateCar, catchAsync(async (req, res, next) => {
    req.flash('success', 'New Car added Successfully !!');
    const car = new Car(req.body.car);
    car.manager = res.locals.managerId;
    await car.save();
    res.redirect(`/cars/${car.id}`)
}))

router.get('/:id', catchAsync(async(req, res) => {
    const car = await Car.findById(req.params.id).populate('reviews').populate('manager');
    if(!car){
        req.flash('error', 'Car Not Found !!')
        res.redirect('/cars')
    }
    res.render('cars/show', {car});
}))

router.put('/:id', validateCar, catchAsync(async(req, res) => {
    const { id } = req.params;
    const car = await Car.findById(id);
    if(!car.manager.equals(req.user.id)){
        req.flash('error','Permession Denied !!')
        return res.redirect(`/cars/${id}`)
    }
    await Car.findByIdAndUpdate(id, {...req.body.car});
    req.flash('success', 'Car Updated Successfully !!');
    res.redirect(`/cars/${id}`)
}))

router.delete('/:id', catchAsync(async(req, res)=>{
    const {id} = req.params;
    await Car.findByIdAndDelete(id);
    req.flash('success', 'Car has been Deleted !!');
    res.redirect('/cars');
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async(req, res) => {
    const car = await Car.findById(req.params.id);
    if(!car){
        req.flash('error', 'Car Not Found !!')
        res.redirect('/cars')
    }
    res.render('cars/edit', {car});
}))

module.exports = router;