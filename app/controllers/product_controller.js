import { Product } from "../models/product.model.js";
import fs from "fs";
import { validationResult } from "express-validator";
import { deleteFromS3, uploadToS3 } from "../middlewares/file_upload.js";

export const addProduct = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, description, category, is_best_seller, price, total_quantity, insurance, selected_insurance } = req.body
    try {
        const existingProduct = await Product.findOne({ name });
        if (existingProduct) {
            for (const image of existingProduct.images) {
                await deleteFromS3(image.key);
            }
        }
        const filesData = req.files
        let images = []
        for (const file of filesData) {
            const uploadResult = await uploadToS3(file)
            images.push(uploadResult)
        }
        const product = await Product.findOneAndUpdate({ name }, {
            $set: {
                name,
                description,
                category,
                is_best_seller,
                price,
                total_quantity,
                user: req.user._id,
                images,
                insurance,
                selected_insurance
            },
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
