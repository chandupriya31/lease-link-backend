import Dispute from "../models/dispute.model.js";

import { Product } from "../models/product.model.js";

import { validationResult } from "express-validator";

export const createDispute = async (req, res) => {
    const { userId, productId, description, location, image } = req.body;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() })
    }
    try {
        const productExists = await Product.findById(productId);
        if (!productExists) {
            return res.status(400).json({ message: "Product does not exist" });
        }

        const newDispute = {
            userId,
            productId,
            description,
            location,
            image,
        }
        await Dispute.create(newDispute)
        return res.status(201).json({ newDispute, message: "Dispute has been Raised Successfully" })

    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Something Went Wrong... please try again later", err })
    }
}
export const getAllDisputes = async (req, res) => {
    try {
        const filter = { status:"pending" };
        const disputes = await Dispute.find(filter);

        if (disputes.length === 0) {
            return res.status(200).json({ message: "No Current Pending Disputes" });
        }

        return res.status(200).json(disputes);
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: "Something went wrong. Please try again later.",err});
    }
};

export const getDisputeById = async (req, res) => {
    const id = req.params.id;

    try {
        const dispute = await Dispute.findById(id);

        if (!dispute) {
            return res.status(404).json({ message: "Dispute not found" });
        }

        console.log(dispute);

        return res.status(200).json({ dispute });

    } catch (err) {

        console.log(err);

        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
};
export const updateDisputeStatus = async (req, res) => {
    const id = req.params.id
    const { status } = req.body
    try {
        const dispute = await Dispute.findByIdAndUpdate(id, { status }, { new: true })

        if (!dispute) {
            return res.status(400).send({ message: "Dispute doesn't exist by that id" })
        }

        return res.status(200).json({ message: `Dispute updated Successfully to status: ${status} `})
    } catch (err) {
        return res.status(500).json({ message: "Something went wrong. Please try again later.", err });
    }
}

export const deleteDispute = async (req, res) => {
    const id = req.params.id
    try {
        const dispute = await Dispute.findByIdAndDelete(id)
        if (!dispute) {
            return res.status(400).json({ message: "Dispute did not find by that id :" })
        }
        return res.status(200).json({ message: "Dispute have been deleted Successfully" })
    } catch (err) {
        return res.status(500).json({ message: "Something went wrong. Please try again later." });
    }
}