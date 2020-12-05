const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },

    location: {
        type: Object,
        required: true
    },
    comments: {
        type: Array,
    },
    imageUrl: {
        type: String,
        required: true
    },
    user_name: {
        type: String,
        required: true
    },
    user_email: {
        type: String,
        required: true
    },
    user_phoneNumber: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamp: true,
});

ProductSchema.index({ location: "2dsphere" });

const Product = mongoose.model('product', ProductSchema);
module.exports = Product