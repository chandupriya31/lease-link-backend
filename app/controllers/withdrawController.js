import WithdrawRequest from "../models/WithdrawRequest.js";
import { Wallet } from "../models/wallet.model.js";
// Admin gets all withdrawal requests
import { BankDetails } from "../models/bank-details.model.js";
// User submits a withdrawal request
export const requestWithdraw = async (req, res) => {
    try {
        const { userId } = req.params;
        const { amount } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: "Amount must be greater than zero" });
        }

        const wallet = await Wallet.findOne({ userId });

        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({ success: false, message: "Insufficient balance" });
        }

        // Deduct amount from wallet
        wallet.balance -= amount;
        await wallet.save();

        // Store withdrawal request
        const withdrawRequest = new WithdrawRequest({ userId, amount });
        await withdrawRequest.save();

        res.status(200).json({ success: true, message: "Withdrawal request submitted", request: withdrawRequest });
    } catch (error) {
        console.error("Error processing withdrawal request:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};



// Get all withdrawal requests with user bank details
export const getAllWithdrawRequests = async (req, res) => {
    try {
        const requests = await WithdrawRequest.find()
            .populate({
                path: "userId",
                select: "name email"
            })
            .lean(); // Converts Mongoose documents to plain JSON

        // Fetch bank details separately and merge them with the withdrawal requests
        const userIds = requests.map(req => req.userId._id);
        const bankDetails = await BankDetails.find({ userId: { $in: userIds } }).lean();

        // Map bank details to the corresponding withdrawal requests
        const requestsWithBankDetails = requests.map(request => {
            const userBankDetails = bankDetails.find(bank => bank.userId.toString() === request.userId._id.toString());
            return {
                ...request,
                bankDetails: userBankDetails || null // If no bank details found, set to null
            };
        });

        res.status(200).json({ requests: requestsWithBankDetails });
    } catch (error) {
        console.error("Error fetching withdrawal requests:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
export const deleteWithdrawRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        // Find the withdrawal request
        const withdrawRequest = await WithdrawRequest.findById(requestId);
        // Delete the withdrawal request
        await WithdrawRequest.findByIdAndDelete(requestId);

        res.status(200).json({ success: true, message: "Withdrawal request deleted" });
    } catch (error) {
        console.error("Error deleting withdrawal request:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};