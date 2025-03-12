import { Schema, model } from 'mongoose';

const insuranceSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    plan_name: {
        type: String,
        required: [true, 'Insurance plan name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Insurance plan description is required']
    },
    price: {
        type: Number,
        required: [true, 'Insurance plan price is required'],
        min: [0, 'Price cannot be negative']
    },
    features: {
        type: [String],
        default: []
    },
    is_active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export const Insurance = model('Insurance', insuranceSchema);
