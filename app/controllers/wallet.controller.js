import { Wallet } from "../models/wallet.model.js";

export const walletAmount = async (req, res) => {
    try {
        const { userId } = req.params;

      
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }

      
        const wallet = await Wallet.findOne({ userId });

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
console.log(req.body)
        
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }

    


        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Amount must be greater than zero" });
        }

        
        if (!["credit", "debit"].includes(type)) {
            return res.status(400).json({ success: false, message: "Invalid transaction type. Use 'credit' or 'debit'" });
        }

       
        let wallet = await Wallet.findOne({ userId });

        
        if (!wallet) {
            wallet = new Wallet({ userId, balance: 0, transactions: [] });
        }


        if (type === "debit" && wallet.balance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        wallet.balance = type === "credit" ? wallet.balance + amount : wallet.balance - amount;


        wallet.transactions.push({ amount, type, description });


        await wallet.save();

        res.status(200).json({ success: true, message: `Wallet ${type} successful`, balance: wallet.balance, transactions: wallet.transactions });
    } catch (error) {
        console.error("Error updating wallet:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
