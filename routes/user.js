const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { route } = require('./cars');
const catchAsync = require('../utils/catchAsync');
const Car = require('../models/car');
const passport = require('passport');
const {storeReturnTo} = require('../middleware');
const Order = require('../models/order');
const generateOrderID = require('../utils/genOrderId');
const {isLoggedIn} = require('../middleware');
const {format} = require('date-fns');

router.get('/register', (req, res) => {
    res.render('users/register')
})

router.post('/register', catchAsync(async(req, res) => {
    try{
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const regUser = await User.register(user, password);
        req.login(regUser, err => {
            if(err) return next(err);
            req.flash('success','Welcome to Drive-Aura');
            res.redirect('/cars');
        })
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}))

router.get('/login', (req, res) => {
    res.render('users/login')
})

router.post('/login', storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'Welcome to Drive-Aura !');
    const redirectUrl = res.locals.returnTo || '/';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res, next) =>{
    req.logout(function(err){
        if(err){
            return next(err);
        }
        req.flash('success', 'GoodBye !')
        res.redirect('/')
    });
})

router.get('/users/cars/:type', async (req, res, next) => {
    const {type} = req.params;
    const cars = await Car.find({"type":type});
    res.render('cars/index', {cars})
})

router.get('/users/cars/booking/:carName', isLoggedIn, async (req, res, next) => {
    const {carName} = req.params;
    req.session.carName = carName;
    const car = await Car.findOne({"name":carName});
    res.render('use/booking',{ car});
})

router.post('/users/cars/payment', isLoggedIn, async(req, res)=>{
    const bookingDate = new Date();
    bookingDate.setHours(0, 0, 0, 0);
    const{days,price}=req.body;
    let carPickupDate;

    if(!req.body.carPickupDate.length) {
        carPickupDate = bookingDate; 
    }
    else{
        carPickupDate = new Date(req.body.carPickupDate);
        carPickupDate.setHours(0, 0, 0, 0);
    }

    const carName = req.session.carName;
    const amount = days*price;
    
    const flag = true;
    let orderID;
    while(flag){
        orderID = generateOrderID();
        const order = await Order.find({"OrderId":orderID});
        if(order.length == 0){
            break;
        } else {
            continue;
        }
    }
    const order = new Order({OrderId: orderID,username: req.user.username,carName: carName, 
        isDispatch: false, pickUpDate: format(carPickupDate,'dd-MM-yyyy'), amount: amount});
    const car = await Car.findOne({"name":carName});
    car.isBooked = true;
    await car.save();
    order.car = car;
    await order.save();
    res.render('use/payment',{order});
})

router.post('/users/car/confirmation', async(req, res) => {
    const {payStatus} = req.body;
    const carName = req.session.carName;
    const car = await Car.findOne({"name":carName});
    const order = await Order.findOne({"car":car.id}).populate("car");
    if(payStatus === "done")
        order.isPay = true;
    else
        order.isPay = false;
    order.save();
    res.render("use/confirmation",{order});
})

module.exports = router;