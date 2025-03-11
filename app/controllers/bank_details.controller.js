import { BankDetails } from "../models/bank-details.model.js";

export const addBankDetails = async (req, res) => {
    try {
        const { accountHolderName, accountNumber, sortCode, bankName, bankAddress } = req.body;

        if (!accountHolderName || !accountNumber || !sortCode || !bankName || !bankAddress) {
            return res.status(400).json({ success: false, message: "Please add the required data" });
        }
        let bankDetails = {
            accountHolderName,
            accountNumber,
            sortCode,
            bankName,
            bankAddress
        };
        await BankDetails.create(bankDetails);
        res.status(201).json({ success: true, message: "Bank details created successfully" });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Something went wrong... please try again later', error: err.message });
    }
};

export const getDetails = async (req, res) => {
    try {
        const bankDetailsList = await BankDetails.find({});
        res.status(200).json({ success: true, data: bankDetailsList });
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
        res.status(200).json({ success: true, message: "Fetched bank detail successfully", bankDetails });
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
