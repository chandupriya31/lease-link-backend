import { Schema, model } from 'mongoose';

const billingSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        addressId: {
            type: Schema.Types.ObjectId,
            ref: 'address',
            required: true,
        },
        cartIds: [{
            type: Schema.Types.ObjectId,
            ref: 'Cart',
            required: true,
        }]
    },
    { timestamps: true }
);

const Billing = model('Billing', billingSchema);

export default Billing;