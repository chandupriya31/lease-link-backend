
import { Schema, model } from 'mongoose';

const cartSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: {
        type: Number,
        default: 1
    },
    total_price: Number,
    start_time: Date,
    end_time: Date
}, { timestamps: true });

const Cart = model('Cart', cartSchema);

export default Cart;