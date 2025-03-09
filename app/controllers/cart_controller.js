import Cart from "../models/cart.model";
import { Product } from "../models/product.model";

export const createCart = async (req, res) => {
    try {
        const { product, quantity, start_time, end_time } = req.body;
        const productData = await Product.findById(product);
        if (!productData) {
            return res.status(404).json({ message: "Product not found" });
        }
        const cart = {
            product,
            quantity,
            user: req.user._id,
            total_price: productData.price * quantity,
            start_time,
            end_time
        }
        await Cart.create(cart);
        return res.json({ cart, message: "Cart created successfully" });
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}
