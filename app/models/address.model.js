import { Schema, model } from 'mongoose';

const addressSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    address_type: {
        type: String,
        required: true
    },
    address_details: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Address = model('address', addressSchema);

export default Address;