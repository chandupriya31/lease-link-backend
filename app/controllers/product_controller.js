import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { validationResult } from "express-validator";
import { deleteFromS3, uploadToS3 } from "../middlewares/file_upload.js";
import { Insurance } from "../models/insurance.model.js";
import { Category } from "../models/category.model.js";
import Rating from "../models/rating.model.js";
import { User } from "../models/user.model.js";



export const addProduct = async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}

	const {
		name,
		description,
		category,
		is_best_seller,
		price,
		total_quantity,
		insurance,
		selected_insurance,
		brand_name,
		model_name,
		userId,
	} = req.body;

	if (!mongoose.Types.ObjectId.isValid(category)) {
		return res.status(400).json({ message: "Invalid category ID" });
	}

	try {
		const existingProduct = await Product.findOne({ name });
		if (existingProduct) {
			await Promise.all(
				existingProduct.images.map((image) => deleteFromS3(image.key))
			);
		}

		const filesData = req.files || [];
		const images = await Promise.all(
			filesData.map((file) => uploadToS3(file))
		);

		const product = await Product.findOneAndUpdate(
			{ name },
			{
				$set: {
					name,
					description,
					category,
					is_best_seller,
					price: parseFloat(price),
					total_quantity: parseInt(total_quantity, 10),
					userId,
					images,
					insurance,
					selected_insurance,
					brand_name,
					model_name,
				},
			},
			{ new: true, upsert: true }
		);

		return res.json({ product, message: "Product added successfully" });
	} catch (err) {
		return res.status(500).json({
			message: "Something went wrong... please try again later",
		});
	}
};

export const getAllProducts = async (req, res) => {
	const page = parseInt(req.query.page, 10) || 1;
	const limit = 16;
	const skip = (page - 1) * limit;
	try {
		const products = await Product.find().limit(limit).skip(skip);
		res.json({ products, page, limit });
	} catch (err) {
		console.error("Error in getAllProducts:", err);
		return res.status(500).json({
			message: "Something went wrong... please try again later",
		});
	}
};

export const getproductscategory = async (req, res) => {
	const categoryid = req.params.categoryid;
	console.log(categoryid);

	try {
		let products;
		if (categoryid) {
			if (!mongoose.Types.ObjectId.isValid(categoryid)) {
				return res.status(400).json({ message: "Invalid category ID" });
			}
			products = await Product.find({ category: categoryid });
		} else {
			products = await Product.find();
		}

		if (!products.length) {
			return res.status(404).json({ message: "No products found" });
		}

		res.json(products);
	} catch (err) {
		console.error("Error in getproductscategory:", err);
		return res.status(500).json({
			message: "Something went wrong... please try again later",
		});
	}
};






export const getIndividualProduct = async (req, res) => {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        const category = await Category.findById(product.category);
        const ratings = await Rating.find({ product: id });

        const userIds = ratings.map(rating => rating.user);


        const userDetails = await User.find({ _id: { $in: userIds } }, 'email avatar');

      
        const userDetailsMap = userDetails.reduce((acc, user) => {
            acc[user._id.toString()] = {
                email: user.email,
                avatar: user.avatar,
            };
            return acc;
        }, {});

   
        const ratingsWithUserDetails = ratings.map(rating => ({
            ...rating.toObject(), 
            email: userDetailsMap[rating.user.toString()]?.email, 
            avatar: userDetailsMap[rating.user.toString()]?.avatar, 
        }));

        
        const insuranceDetails = await Insurance.find({
            _id: { $in: product.selected_insurance },
        });

    
        let averageRating = 0;
        if (ratings.length > 0) {
            const totalRatings = ratings.reduce((acc, rating) => acc + rating.rating, 0);
            averageRating = totalRatings / ratings.length;
        }

    
        return res.status(200).json({
            success: true,
            product,
            category,
            ratings: ratingsWithUserDetails,
            averageRating,
            insurance: insuranceDetails,
        });
    } catch (err) {
        console.error("Error in getIndividualProduct:", err);
        return res.status(500).json({
            success: false,
            message: "Something went wrong... please try again later",
        });
    }
};






export const deleteProduct = async (req, res) => {
	const id = req.params.id;
	try {
		await Product.findByIdAndDelete(id);
		res.json({ message: "Product deleted successfully" });
	} catch (err) {
		return res.status(500).json({
			message: "Something went wrong... please try again later",
		});
	}
};
