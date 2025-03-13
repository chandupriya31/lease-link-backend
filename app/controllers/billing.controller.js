import Billing from "../models/billing.model.js";

export const createBill = async (req, res) => {
    try {
        const { user, addressId, cartIds } = req.body;

        // Check if all required fields are provided
        if (!user || !addressId || !cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
            return res.status(400).json({ message: "Required fields are missing or invalid" });
        }        
        
        const newBilling = await Billing.create({
            user,
            addressId,
            cartIds
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
        const billingData = await Billing.find({ user: user_id })
            .populate("user")
            .populate("addressId")
            .populate("cartIds");
            
        if (!billingData || billingData.length === 0) {
            return res.status(404).json({ message: "No billing records found for this user" });
        }
        
        res.status(200).json({ message: "Billing records retrieved successfully", data: billingData });
    } catch (error) {
        console.error("Error fetching billing records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
