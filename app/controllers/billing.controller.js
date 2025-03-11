import Billing from "../models/billing.model.js";

export const createBill = async (req, res) => {
    try {
        const { user_id, full_name, phone_number, email, address, state, pincode } = req.body;

        if (!user_id || !full_name || !address) {
            return res.status(400).json({ message: "Required fields are missing" });
        }        
        await Billing.create({
            user: user_id,
            full_name,
            phone_number,
            email,
            address,
            state,
            pincode,
        });
        res.status(201).json({ message: "Billing record created successfully", data: newBilling });
    } catch (error) {
        console.error("Error creating billing record:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllData = async (req, res) => {
    try {
        const { user_id } = req.params; 
        const billingData = await Billing.find({ user: user_id }).populate("user");
        if (!billingData || billingData.length === 0) {
            return res.status(404).json({ message: "No billing records found for this user" });
        }
        res.status(200).json({ message: "Billing records retrieved successfully", data: billingData });
    } catch (error) {
        console.error("Error fetching billing records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
