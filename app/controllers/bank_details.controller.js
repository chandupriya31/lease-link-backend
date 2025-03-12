import { BankDetails } from "../models/bank-details.model.js";
import { authenticateUser } from "../middlewares/auth_middlewares.js";

export const addBankDetails = async (req, res) => {
    try {
        const {userId, accountHolderName, accountNumber, sortCode, bankName, bankAddress, wallet } = req.body;

        if (!accountHolderName || !accountNumber || !sortCode || !bankName || !bankAddress) {
            return res.status(400).json({ success: false, message: "Please add the required data" });
        }
        let bankDetails = {
            userId,
            accountHolderName,
            accountNumber,
            sortCode,
            bankName,
            bankAddress,
            wallet
        };
        await BankDetails.create(bankDetails);
        res.status(201).json({ success: true, message: "Bank details created successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong... please try again later', error: err.message });
    }
};

export const getDetails = async (req, res) => {
    try {
        const { userId } = req.params;
        // Check if userId is a valid MongoDB ObjectId
        if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format" });
        }

        // Query the database
        const bankDetails = await BankDetails.find({ userId });
         console.log(bankDetails);
        // Check if user exists
        if (!bankDetails) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json(bankDetails);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong... please try again later', error: err.message });
    }
};

export const getDetailsById = async (req, res) => {
    const { id } = req.params;
    try {
        const bankDetails = await BankDetails.findById(id);
        if (!bankDetails) {
            return res.status(404).json({ success: false, message: "Bank details not found" });
        }
        res.status(200).json(bankDetails);
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong... please try again later', error: err.message });
    }
};

export const updateDetails = async (req, res) => {
    const { id } = req.params;
    const { accountHolderName, accountNumber, sortCode, bankName, bankAddress } = req.body;

    try {
        const updatedBankDetail = await BankDetails.findByIdAndUpdate(
            id,
            { accountHolderName, accountNumber, sortCode, bankName, bankAddress },
            { new: true, runValidators: true }
        );

        if (!updatedBankDetail) {
            return res.status(404).json({ success: false, message: "Bank details not found" });
        }

        res.status(200).json({ success: true, message: "Bank details updated successfully", data: updatedBankDetail });
    } catch (err) {
        res.status(400).json({ success: false, message: 'Something went wrong... please try again later', error: err.message });
    }
};

export const deleteBankDetails = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedBankDetail = await BankDetails.findByIdAndDelete(id);
        if (!deletedBankDetail) {
            return res.status(404).json({ success: false, message: "Bank details not found" });
        }
        res.status(200).json({ success: true, message: "Bank details deleted successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong... please try again later', error: err.message });
    }
};

export const getWalletamount = async (req, res) => {
    try {
        const userId = req.userId; // Get userId from the request object (added by middleware)

        // Fetch the document for the logged-in user
        const bankDetails = await BankDetails.findOne({ userId });

        if (!bankDetails) {
            return res.status(404).json({ success: false, message: 'Bank details not found for this user' });
        }
        const walletAmount = bankDetails.wallet;
        res.status(200).json({ success: true, message: 'Wallet amount fetched successfully', walletAmount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Something went wrong... please try again later', error: err.message });
    }
};