import { Wallet } from "../models/wallet.model.js";

export const walletAmount = async (req, res) => {
    try {
        const { userId } = req.params;

        // Validate userId format (must be a valid MongoDB ObjectId)
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }

        // Find wallet details for the user
        const wallet = await Wallet.findOne({ userId });

        // If wallet does not exist, return 404
        if (!wallet) {
            return res.status(404).json({ success: false, message: "Wallet not found for this user" });
        }

        res.status(200).json({ success: true, balance: wallet.balance, transactions: wallet.transactions });
    } catch (error) {
        console.error("Error fetching wallet details:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

export const updateWallet = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount, type, description } = req.body;

        // Validate userId
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }

        // Validate amount
        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Amount must be greater than zero" });
        }

        // Validate transaction type
        if (!["credit", "debit"].includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid transaction type. Use 'credit' or 'debit'" });
        }

        // Find wallet
        let wallet = await Wallet.findOne({ userId });

        // If wallet does not exist, create a new one for the user
        if (!wallet) {
            wallet = new Wallet({ userId, balance: 0, transactions: [] });
        }

        // Handle debit transaction
        if (type === "debit" && wallet.balance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        // Update balance
        wallet.balance = type === "credit" ? wallet.balance + amount : wallet.balance - amount;

        // Add transaction record
        wallet.transactions.push({ amount, type, description });

        // Save updated wallet
        await wallet.save();

        res.status(200).json({ success: true, message: `Wallet ${type} successful`, balance: wallet.balance, transactions: wallet.transactions });
    } catch (error) {
        console.error("Error updating wallet:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
