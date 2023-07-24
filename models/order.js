const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    OrderId: String,
    username: String,
    isDispatch: Boolean,
    isPay: Boolean,
    pickUpDate: String,
    amount: Number,
    car: {
        type: Schema.Types.ObjectId,
        ref: 'Car'
    }
});

module.exports = mongoose.model('Order', orderSchema);