import Cart from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Insurance } from "../models/insurance.model.js";
import Billing from "../models/billing.model.js";
import mongoose from "mongoose";


export const createCart = async (req, res) => {
    try {
        const { userId, productId, quantity, insuranceId, start_time, end_time, total_price } = req.body;

        console.log("req.body", req.body);

        const cart = new Cart({
            userId,
            productId,
            insuranceId,
            quantity,
            total_price,
            start_time,
            end_time
        });

        await cart.save();

        return res.status(201).json({ cart, message: "Cart created successfully" });
    } catch (err) {
        console.error("Error creating cart:", err);
        return res.status(500).json({ message: "Something went wrong... please try again later" });
    }
};

export const getCartbyuserid = async (req, res) => {

    try {
        console.log(req.params, 'params')
        const userId = new mongoose.Types.ObjectId(req.params.userId);

        const bookedBills = await Billing.find({}, 'cartIds');
        const bookedCartIds = bookedBills.reduce((acc, bill) => {
            return acc.concat(bill.cartIds);
        }, []);

        const cartItems = await Cart.aggregate([
            {
                $match: {
                    userId,

                    _id: { $nin: bookedCartIds }
                }
            },


            {
                $lookup: {
                    from: "products",
                    localField: "productId",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },


            {
                $lookup: {
                    from: 'insurances',
                    localField: "insuranceId",
                    foreignField: "_id",
                    as: "insuranceDetails"
                }
            },
            {
                $unwind: {
                    path: "$insuranceDetails",
                    preserveNullAndEmptyArrays: true
                }
            },


            {
                $addFields: {
                    insurance: {
                        plan_name: "$insuranceDetails.plan_name",
                        price: "$insuranceDetails.price",
                    },
                    insurancePrice: { $ifNull: ["$insuranceDetails.price", 0] },
                    total_price: {
                        $multiply: [
                            { $add: ["$productDetails.price", { $ifNull: ["$insuranceDetails.price", 0] }] },
                            "$quantity"
                        ]
                    },
                    "product.name": "$productDetails.name",
                    "product.images": "$productDetails.images"
                }
            },


            {
                $group: {
                    _id: "$userId",
                    cartItems: { $push: "$$ROOT" },
                    totalCartPrice: { $sum: "$total_price" }
                }
            }
        ]);

        if (!cartItems.length) {
            return res.status(404).json({ message: "No cart items found for this user" });
        }

        return res.json(cartItems[0]);
    } catch (err) {
        console.error("Error fetching cart:", err);
        return res.status(500).json({ message: "Something went wrong... please try again later" });
    }
};



export const deleteCart = async (req, res) => {
    try {
        const { cartId } = req.params;
        const cart = await Cart.findByIdAndDelete(cartId);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        return res.json({ message: "product deleted successfully", user_id: cart.userid });
    } catch (err) {
        console.error("Error deleting cart:", err);
        return res.status(500).json({ message: "Something went wrong... please try again later" });
    }
};



export const updateCart = async (req, res) => {
    try {
        const { cartid } = req.params;
        const { quantity } = req.body;
        const cart = await Cart.findById(cartid);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }


        cart.quantity = quantity;
        await cart.save();

        return res.json({ cart, message: "Cart updated successfully", user_id: cart.userid });
    } catch (err) {
        console.error("Error updating cart:", err);
        return res.status(500).json({ message: "Something went wrong... please try again later" });
    }
};

export const getCartById = async (req, res) => {
    try {
        const { cartid } = req.params;
        const cart = await Cart.findById(cartid);
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        return res.json({ cart, user_id: cart.userId });
    } catch (err) {
        console.error("Error fetching cart:", err);
        return res.status(500).json({ message: "Something went wrong... please try again later" });
    }
};


export const getAllCartCountnyuserId = async (req, res) => {
    try {
        const { userId } = req.params;

        
        const bookedBills = await Billing.find({}, 'cartIds');
        const bookedCartIds = bookedBills.reduce((acc, bill) => {
            return acc.concat(bill.cartIds);
        }, []);

        
        const cartItems = await Cart.find({
            userId: userId,
            _id: { $nin: bookedCartIds }
        });

        if (!cartItems || cartItems.length === 0) {
            return res.status(200).json({ count: 0 });
        }

        return res.json({ count: cartItems.length });
    } catch (err) {
        console.error("Error fetching cart count:", err);
        return res.status(500).json({ message: "Something went wrong... please try again later" });
    }
};
