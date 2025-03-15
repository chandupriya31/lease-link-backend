import mongoose from "mongoose";
import Billing from "../models/billing.model.js";
import Cart from "../models/cart.model.js";
import { Order } from "../models/order.model.js";

export const createBill = async (req, res) => {
    try {
        const { user, addressId, cartIds } = req.body;
        console.log('inside', req.body)

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
                    { path: 'productId', populate: { path: 'user', select: 'name email' } },
                    { path: 'insuranceId', select: 'name' }
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
        console.log(user_id, 'user')
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
        console.log(requestedOrders, 'requested')
        const filteredOrders = requestedOrders
            .map(billing => ({
                ...billing,
                cartIds: billing.cartIds.filter(cart =>
                    cart.productId !== null &&
                    cart.productId.selected_insurance !== null
                )
            }))
            .filter(billing => billing.cartIds.length > 0);

        if (filteredOrders.length === 0) {
            return res.status(404).json({ message: "No rental requests found for your products" });
        }
        console.log('filtered', filteredOrders)
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
    const { cartId, status, userId } = req.body;
    try {
        const cartProduct = await Cart.findById(cartId).populate("productId");
        if (!cartProduct) {
            return res.status(404).json({ message: "No order found" });
        }
        const productId = cartProduct.productId;
        const userObjectId = new mongoose.Types.ObjectId(userId);

        if (!productId.user.equals(userObjectId)) {
            return res.status(403).json({ message: "You are not authorized to update this order" });
        }

        if (status === "accepted") {
            const billing = await Billing.findOne({ user: cartProduct.userId });
            if (!billing) {
                return res.status(404).json({ message: "Billing details not found" });
            }

            const existingOrder = await Order.findOne({ product: cartProduct.productId });
            if (!existingOrder) {
                const newOrder = {
                    renter: cartProduct.userId,
                    lender: productId.user,
                    product: cartProduct.productId,
                    billing: billing._id,
                    transaction_id: null,
                    amount: cartProduct.total_price,
                    cartId
                };
                console.log('new', newOrder)
                await Order.create(newOrder);
            }
        }
        const updatedOrder = await Cart.findByIdAndUpdate(
            cartId,
            { status },
            { new: true }
        );
        return res.json({ updatedOrder, message: "Order updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong... please try again later" });
    }
};