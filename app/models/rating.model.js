import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Rating = mongoose.model('rating', ratingSchema);

export default Rating;
