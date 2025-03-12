import Address from "../models/address.model.js";


export const createAddress = async (req, res) => {
    try {
        const { user_id, address_type, address_details } = req.body;

      
        if (!user_id || !address_type || !address_details) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const address = await Address.create({
            user_id,
            address_type,
            address_details
        });

        res.status(201).json({ message: "Address created successfully", data: address });
    } catch (error) {
        console.error("Error creating address:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAddressById = async (req, res) => {
    try {
        const { user_id } = req.params;
        const addresses = await Address.find({ user: user_id });

        if (!addresses || addresses.length === 0) {
            return res.status(404).json({ message: "No addresses found for this user" });
        }

        res.status(200).json({ message: "Addresses retrieved successfully", data: addresses });
    } catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};