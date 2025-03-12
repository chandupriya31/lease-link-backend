import { Schema, model } from 'mongoose';

const bankDetailsSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true // Ensure every bank detail entry is linked to a user
    },
    accountHolderName: {
        type: String,
        required: true,
        trim: true
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\d{8}$/.test(v); // Ensures exactly 8-digit numbers
            },
            message: 'Account number must be 8 digits'
        }
    },
    sortCode: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{2}-\d{2}-\d{2}$/.test(v); // Ensures XX-XX-XX format
            },
            message: 'Sort code must be in format XX-XX-XX'
        }
    },
    bankName: {
        type: String,
        required: true,
        trim: true
    },
    bankAddress: {
        type: String,
        required: true,
        trim: true
    },
    wallet: {
        type: Number,  // Changed from String to Number
        required: false,
        default: 0,  // Defaulting wallet balance to 0
        min: 0        // Ensures wallet balance can't be negative
    }
}, {
    timestamps: true
});

export const BankDetails = model('BankDetails', bankDetailsSchema);
