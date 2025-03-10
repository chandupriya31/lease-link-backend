import mongoose from "mongoose"
const blogSchema=new mongoose.Schema({
    image:{ 
        type:String,
        trim: true
    },
    title:{
        type : String,
        trim: true
    },
    description:{
        type:String,
        trim: true
    }
},{timestamps:true})
export const Blog = mongoose.model("Blog",blogSchema)