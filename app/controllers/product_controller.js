import { Product } from "../models/product.model.js";

export const addProduct = async (req, res) => {
    const { name, description, category, is_best_seller, price, images } = req.body
    try {
        const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
        fs.unlink(req.file.path, (err) => {
            if (err) console.error("Error deleting file:", err);
        });
        const product = await Product.findOneAndUpdate({ name }, {
            $set: {
                name,
                description,
                category,
                is_best_seller,
                price
            },
            $push: { images: result.secure_url }
        }, { new: true, upsert: true })
        res.json({ product, message: "Product added succesfully" })
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}

export const getAllProducts = async (req, res) => {
    try {

    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}

export const getIndividualProduct = async (req, res) => {
    try {

    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}

export const deleteProduct = async (req, res) => {
    try {

    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}
