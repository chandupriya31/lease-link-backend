import mongoose from "mongoose"
const faqSchema=mongoose.Schema({
    question:{
        type:String,
        trim: true
    },
    answer:{
        type:String,
        trim: true
    }
},{timestamps:true})
export const FAQ = mongoose.model("FAQ",faqSchema)