const express = require('express');
const router = express.Router({mergeParams:true});
const {isLoggedIn} = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const Order = require('../models/order');

router.get('/bookings', isLoggedIn, catchAsync(async(req, res) => {
    const orders = await Order.find({});
    res.render('manager/bookings', {orders});
}))

module.exports = router;