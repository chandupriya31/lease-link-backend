import {validationResult} from "express-validator"
import { FAQ } from "../models/faq.model.js"

export const getAllFAQS=async(req,res)=>{
    try{
        const faqLists=await FAQ.find()
        if(!faqLists){
            return res.status(400).json({message:"Unable to Fetch FAQ Lists"})
        }
        return res.status(200).json(faqLists)

    }catch(err){
        console.error("Error in fetching FAQs", err)
        res.status(500).json({ messgae: "Something went wrong! please try again later",err })
    }
}

export const createFAQ=async(req,res)=>{
    try{
        const errors=validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({error:errors.array()})
        }
        const {question,answer}=req.body
        const newFAQ={
            question,
            answer
        }
        await FAQ.create(newFAQ)
        return res.status(200).json({message:"FAQ Have been Created Successfully"})
    }catch(err){
        console.error({message:"Error in Creating FAQ",err})
        return res.status(500).send({message:"Something Went Wrong! Please Try Again Later"})
    }
}
