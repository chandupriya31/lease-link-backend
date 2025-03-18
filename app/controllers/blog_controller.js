import { validationResult } from "express-validator"

import { Blog } from "../models/blog.model.js";
import { uploadToS3 } from "../middlewares/file_upload.js";

export const getAllBlogs = async (req, res) => {
    try {


        const blogsList = await Blog.find()
        if (!blogsList) {
            return res.status(400).json({ message: "Unable to fetch the blog Lists! " })
        }
        return res.status(200).json(blogsList)

    } catch (err) {

        console.error("Error in fetching Blogs", err)
        return res.status(500).json({ messgae: "Something went wrong! please try again later", err })

    }
};
export const getBlogById = async (req, res) => {
    try {
        const id = req.params.id
        const blog = await Blog.findById(id)
        if (!blog) {
            return res.status(400).json({ message: "Blog Doesnt Exist by that ID " })
        }
        return res.status(200).json({ blog })

    } catch (err) {
        console.error("Errors in Fetching Blog ", err)
        return res.status(500).json({ message: "Unable to fetch blog by that id", err })

    }
}

export const createBlog = async (req, res) => {
    console.log(req.body, req.files)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() })
    }
    const { title, description } = req.body;

    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please add image" })
        }
        const fileData = req.file;
        let image = null;
        if (fileData) {
            image = await uploadToS3(fileData);
        }
        console.log(image, 'img')
        const newBlog = {
            image,
            title,
            description,
        }
        await Blog.create(newBlog)
        return res.status(201).json({ message: "Blog have been Created Successfully", newBlog })


    } catch (err) {
        console.error("Error in creating a Blog: ", err)
        return res.status(500).send({ message: "Something Went Wrong! Please try again later", err })
    }
}

export const editBlog = async (req, res) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() })
    }
    try {
        
        const id = req.params.id
        const updates = req.body

        const existingBlog = await Blog.findById(id);
                if (!existingBlog) {
                    return res.status(404).json({ message: "Blog not found with that ID" });
                }
        
               
                if (req.file) {
                    const imageUrl = await uploadToS3(req.file); 
                    updates.image = imageUrl; 
                }

        const updatedBlog = await Blog.findByIdAndUpdate(id, updates, { new: true })
        if (!updatedBlog) {
            return res.status(404).json({
                message: "Blog Not found by that id"
            })
        }
        return res.status(200).json({
            messgae: "Blog Has Been Updated",
            updatedBlog
        })
    } catch (err) {
        return res.status(500).json({
            message: "Something went Wrong... Please try again later", err
        })
    }
}


export const deleteBlog = async (req, res) => {
    try {
        const id = req.params.id;

        const deleteBlog = await Blog.findByIdAndDelete(id)

        if (!deleteBlog) {
            return res.status(400).json({ message: "Unable to find blog by that id" })
        }

        return res.status(200).json({ message: "Blog has been deleted Successfully", deleteBlog })


    } catch (err) {
        console.error("Delete category error:", err);
        return res.status(500).json({ message: "Something Went Wrong! Please try again later", err })
    }
}
