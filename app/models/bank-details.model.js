import { Schema, model } from 'mongoose';

const bankDetailsSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
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
                return /^\d{8}$/.test(v);
            },
            message: 'Account number must be 8 digits'
        }
    },
    sortCode: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\d{2}-\d{2}-\d{2}$/.test(v);
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
    }
}, {
    timestamps: true
});

export const BankDetails = model('BankDetails', bankDetailsSchema);