import { Schema, model } from 'mongoose';

const walletSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // Each user has only one wallet
    },
    balance: {
        type: Number,
        required: true,
        default: 0, // Default balance starts at 0
        min: 0      // Prevents negative balances
    },
    transactions: [
        {
            amount: {
                type: Number,
                required: true
            },
            type: {
                type: String,
                enum: ['credit', 'debit'], // Ensures valid transaction types
                required: true
            },
            description: {
                type: String,
                trim: true
            },
            timestamp: {
                type: Date,
                default: Date.now // Auto-assign current timestamp
            }
        }
    ]
}, {
    timestamps: true
});

export const Wallet = model('Wallet', walletSchema);
