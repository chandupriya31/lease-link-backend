import mongoose from "mongoose"
const blogSchema = new mongoose.Schema({
    image: {
        url: String,
        key: String
    },
    title: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    }
}, { timestamps: true })
export const Blog = mongoose.model("Blog", blogSchema)