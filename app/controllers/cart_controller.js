import Cart from "../models/cart.model";
import { Product } from "../models/product.model";

export const createCart = async (req, res) => {
    try {
        const { product, quantity, start_time, end_time, total_price } = req.body;
        const productData = await Product.findById(product);
        if (!productData) {
            return res.status(404).json({ message: "Product not found" });
        }
        const cart = {
            product,
            quantity,
            user: req.user._id,
            total_price,
            start_time,
            end_time
        }
        await Cart.create(cart);
        return res.json({ cart, message: "Cart created successfully" });
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}

export const getCart = async (req, res) => {
    try {
        const cart = await Cart.find({ user: req.user._id }).populate('product');
        return res.json(cart);
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}