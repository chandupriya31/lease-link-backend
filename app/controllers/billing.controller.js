import mongoose from "mongoose";
import Billing from "../models/billing.model.js";
import Cart from "../models/cart.model.js";

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

export const getCartData = async (req, res) => {
    try {
        const user_id = new mongoose.Types.ObjectId(req.params.user_id);

        const cartData = await Billing.find({ user: user_id })
            .populate({
                path: 'cartIds',
                populate: [
                    { path: 'productId', populate: { path: 'user', select: 'name email' } }, // Populate product details and owner info
                    { path: 'insuranceId', select: 'name' } // Populate insurance details
                ]
            })
            .lean();

        if (!cartData || cartData.length === 0) {
            return res.status(404).json({ message: "No cart records found for this user" });
        }

        res.status(200).json({
            message: "Cart records retrieved successfully",
            data: cartData
        });
    } catch (error) {
        console.error("Error fetching cart records:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getRequestedOrders = async (req, res) => {
    try {
        const user_id = new mongoose.Types.ObjectId(req.params.user_id);

        const requestedOrders = await Billing.find({ 'cartIds': { $exists: true } })
            .populate({
                path: 'cartIds',
                populate: [
                    {
                        path: 'productId',
                        match: { user: user_id },
                        populate: [
                            { path: 'user', select: 'name email' },
                            { path: 'selected_insurance', select: 'name' }
                        ]
                    },
                ]
            })
            .populate({
                path: 'user',
                select: 'name email'
            })
            .lean();

        // ✅ Filter out products where productId or productId.selected_insurance is null
        const filteredOrders = requestedOrders
            .map(billing => ({
                ...billing,
                cartIds: billing.cartIds.filter(cart =>
                    cart.productId !== null &&
                    cart.productId.selected_insurance !== null // Ensure selected_insurance exists inside productId
                )
            }))
            .filter(billing => billing.cartIds.length > 0);

        if (filteredOrders.length === 0) {
            return res.status(404).json({ message: "No rental requests found for your products" });
        }

        res.status(200).json({
            message: "Requested orders retrieved successfully",
            data: filteredOrders
        });
    } catch (error) {
        console.error("Error fetching requested orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const updateOrderAcceptance = async (req, res) => {
    const { id } = req.params;
    const status = req.body.status;
    try {
        const cartProduct = await Cart.findById(id).populate("productId");
        if (!cartProduct) {
            return res.status(404).json({ message: "No order found" });
        }
        if (productId.user !== req.body.id) {
            return res.status(403).json({ message: "You are not authorized to update this order" });
        }
        const updateOrder = await Cart.findByIdAndUpdate(id, { status: status }, { new: true, upsert: true });
        return res.json({ updateOrder, message: "Order updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong... please try again later" });
    }
}