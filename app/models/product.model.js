import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    name: String,
    description: String,
    user: {
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
    images: [{ url: String, key: String }],
    total_quantity: Number,
    available: Number,
    insurance: {
        type: Boolean,
        default: false
    },
    selected_insurance: [{
        type: Schema.Types.ObjectId,
        ref: 'Insurance'
    }]
}, { timestamps: true });


export const Product = model('Product', productSchema);