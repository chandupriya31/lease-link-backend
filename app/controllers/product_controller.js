import { Product } from "../models/product.model.js";

export const addProduct = async (req, res) => {
    const { name, description, category, is_best_seller, price, images, total } = req.body
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
                price,
                total,
                user: req.user._id,
            },
            $push: { images: result.secure_url }
        }, { new: true, upsert: true })
        res.json({ product, message: "Product added succesfully" })
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}

export const getAllProducts = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 16;
    const skip = (page - 1) * limit;
    try {
        const products = await Product.find().limit(limit).skip(skip);
        res.json({ products, page, limit });
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}

export const getIndividualProduct = async (req, res) => {
    const id = req.params.id;
    try {
        const product = await Product.findById(id).populate('category').populate('user');
        res.json(product);
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}

export const deleteProduct = async (req, res) => {
    const id = req.params.id;
    try {
        await Product.findByIdAndDelete(id);
        res.json({ message: "Product deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}
