import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    name: String,
    brand_name: String,
    model_name: String,
    description: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
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
        type: String,
    }],
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active'
    }
}, { timestamps: true });


export const Product = model('Product', productSchema);