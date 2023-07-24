const Joi = require('joi');

module.exports.carSchema = Joi.object({
    car: Joi.object({
        name: Joi.string().required(),
        price: Joi.number().required().min(0),
        gear: Joi.string().required(),
        seat: Joi.number().required(),
        image: Joi.string().required(),
        type: Joi.string().required()
        }).required()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required(),
        body: Joi.string().required()
    }).required()
})