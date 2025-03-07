import { Schema, model } from 'mongoose';

const productSchema = new Schema({
    name: String,
    description: String,
    category: Schema.Types.ObjectId,
    price: Number,
    is_best_seller: {
        type: Boolean,
        default: false
    },
    images: [String],
    is_active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });


export const Product = model('Product', productSchema);