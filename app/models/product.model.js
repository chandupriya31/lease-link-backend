import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    name: String,
    description: String,
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category'
    },
    price: Number,
    is_best_seller: {
        type: Boolean,
        default: false
    },
    images: [String],
    total: Number,
    available: Number,
}, { timestamps: true });


export const Product = model('Product', productSchema);