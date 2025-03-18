import { Schema, model } from 'mongoose';

const walletSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true 
    },
    balance: {
        type: Number,
        required: true,
        default: 0, 
        min: 0    
    },
    transactions: [
        {
            amount: {
                type: Number,
                required: true
            },
            type: {
                type: String,
                enum: ['credit', 'debit'], 
                required: true
            },
            description: {
                type: String,
                trim: true
            },
            timestamp: {
                type: Date,
                default: Date.now 
            }
        }
    ]
}, {
    timestamps: true
});

export const Wallet = model('Wallet', walletSchema);
