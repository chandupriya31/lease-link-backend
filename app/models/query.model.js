import mongoose from "mongoose";
const contactUsSchema=mongoose.Schema({
    name:String,
    email:String,
    description:String
},{timestamps:true})
const Query=mongoose.model("Query",contactUsSchema)
export {Query}