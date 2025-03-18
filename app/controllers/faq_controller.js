import {validationResult} from "express-validator"
import { FAQ } from "../models/faq.model.js"

//faq

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

export const getFAQById=async(req,res)=>{
    const id=req.params.id
    try{
        const faq= await FAQ.findById(id)
        if(!faq){
            return res.status(400).json({message:"FAQ does not exist by that id"})
        }
        return res.status(200).json(faq)

    }catch(err){
        console.log(err)
        return res.status(500).json({message:"Something Went Wrong",err})
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
        return res.status(500).json({message:"Something Went Wrong! Please Try Again Later"})
    }
}

export const editFAQ = async (req, res) => {
    const id = req.params.id;
    try {
        const { question, answer } = req.body;

        const updatedFAQ = await FAQ.findByIdAndUpdate(
            id,
            { question, answer },
            { new: true } 
        );

        if (!updatedFAQ) {
            return res.status(400).json({ message: "FAQ not found or could not be updated" });
        }

        return res.status(200).json({ message: "FAQ updated successfully", updatedFAQ });

    } catch (err) {
        console.error("Error in updating FAQ", err);
        return res.status(500).json({ message: "Something went wrong! Please try again later" });
    }
};
export const deleteFAQ = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedFAQ = await FAQ.findByIdAndDelete(id);

        if (!deletedFAQ) {
            return res.status(400).json({ message: "FAQ not found or could not be deleted" });
        }

        return res.status(200).json({ message: "FAQ deleted successfully", deletedFAQ });

    } catch (err) {
        console.error("Error in deleting FAQ", err);
        return res.status(500).json({ message: "Something went wrong! Please try again later" });
    }
};
