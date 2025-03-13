import { Schema, model } from 'mongoose';

const addressSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    zipcode: {
        type: String,
        required: true
    },
    proof_type: {
        type: String,
        required: true
    },
    proof_id: {
        type: String,
        required: true
    },
    proof_document: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Address = model('address', addressSchema);

export default Address;