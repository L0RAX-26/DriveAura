const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review')
const User = require('./user');
const { boolean } = require('joi');

const CarSchema = new Schema({
    name: String,
    price: Number,
    seat: Number,
    gear: String,
    image: String,
    type: String,
    location: String,
    isBooked:{
        type: Boolean,
        default: false
    },
    manager: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

CarSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await Review.deleteMany({_id: {$in: doc.reviews}})
    }
})

module.exports = mongoose.model('Car', CarSchema);

// https://source.unsplash.com/random/600x300/?car