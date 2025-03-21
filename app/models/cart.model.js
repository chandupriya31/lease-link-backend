
import { Schema, model } from 'mongoose';

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    },
    insuranceId: {
        type: Schema.Types.ObjectId,
        ref: 'Insurance'
    },
    quantity: {
        type: Number,
        default: 1
    },
    total_price: Number,
    start_time: Date,
    end_time: Date,
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    payment: {
        type: String,
        default: 'pending',
    }
}, { timestamps: true });


const Cart = model('Cart', cartSchema);

export default Cart;