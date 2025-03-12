import Rating from "../models/rating.model.js";

export const createrating = async (req, res) => {
    try {
        const { user_id, product_id, rating, description } = req.body;

      
        if (!user_id || !product_id || !rating || !description) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

     
        const newRating = await Rating.create({
            user: user_id,
            product: product_id,
            rating,
            description
        });

       
        return res.status(201).json({ success: true, message: "Rating created successfully", data: newRating });
    } catch (error) {
        console.error("Error creating rating:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};




export const getRatingByProduct = async (req, res) => {
    try {
        const { product_id } = req.params;
        const ratings = await Rating.find({ product: product_id });

        if (!ratings || ratings.length === 0) {
            return res.status(404).json({ message: "No ratings found for this product" });
        }

        if (ratings.length < 1) {
            return res.status(200).json({ message: "Not enough ratings to calculate an average" });
        }

        const totalRatings = ratings.reduce((acc, rating) => acc + rating.rating, 0);
        const averageRating = totalRatings / ratings.length;

        res.status(200).json({ 
            message: "Ratings retrieved successfully", 
            data: ratings,
            averageRating: averageRating.toFixed(2) // rounding to 2 decimal places
        });
    } catch (error) {
        console.error("Error fetching ratings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};




export const getallratings = async (req, res) => {
    try {
        const ratings = await rating.find();
        res.json(ratings);
    } catch (err) {
        return res.status(500).json({ message: 'Something went wrong... please try again later' });
    }
}