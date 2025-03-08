import {validationResult} from "express-validator"

import {Query} from "../models/query.model.js"

export const createQuery=async(req,res)=>{

    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()})
    }

    try{
        const queryData=req.body
        await Query.create(queryData)
        return res.status(201).json({message:"You can Get a Reply with 2 Working Days"})
    }catch(err){
        console.error("Error creating query : ", err);
        return res.status(500).send({message:"Something Went Wrong! Please try again later"})
    }
}

export const getQueryById= async(req,res)=>{
    try{
        const id=req.params.id
        const query=await Query.findById(id);
        if(!query){
            return res.status(400).json({message:"Query Doesnt Exist by that id"})
        }
        return res.status(200).json(query)

    }catch(err){
        console.error("Error in Fetching query : ", err);
        res.status(500).json({message:"Unable to fetch query by that id"})
    }
}

export const getAllQuery = async(req,res)=>{
    try{

        const queryList=await Query.find()
        res.status(200).json(queryList)

    }catch(err){
        console.error("Error in fetching queries:", err);
        res.status(500).json({message:"Something Went Wrong! please try again later"})
    }
}