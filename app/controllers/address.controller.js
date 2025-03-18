import Address from "../models/address.model.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/proofs';

        
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

export const createAddress = async (req, res) => {
    console.log('req.body', req.body);
    try {
        const {
            user,
            name,
            email,
            phone,
            address,
            city,
            state,
            zipcode,
            proof_type,
            proof_id
        } = req.body;


        if (!req.file) {
            return res.status(400).json({ message: "Proof document is required" });
        }


        const proof_document = req.file.path;

        if (!user || !name || !email || !phone || !address || !city ||
            !state || !zipcode || !proof_type || !proof_id) {
            return res.status(400).json({ message: "All fields are required" });
        }


        const addressData = {
            user,
            name,
            email,
            phone,
            address,
            city,
            state,
            zipcode,
            proof_type,
            proof_id,
            proof_document
        };


        if (req.body.user) {
            addressData.user = req.body.user;
        }

        const newAddress = await Address.create(addressData);

        res.status(201).json({ message: "Address created successfully", data: newAddress });
    } catch (error) {
        console.error("Error creating address:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateAddress = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const existingAddress = await Address.findById(id);
        if (!existingAddress) {
            return res.status(404).json({ message: "Address not found" });
        }

        if (req.file || (req.files && req.files.length > 0)) {
            if (existingAddress.proof_document && existingAddress.proof_document.key) {
                await deleteFromS3(existingAddress.proof_document.key);
            }

            const filesToUpload = req.files || [req.file];
            const uploadedFiles = await Promise.all(
                filesToUpload.map((file) => uploadToS3(file))
            );

            updateData.proof_document = uploadedFiles[0];
        }

        const updatedAddress = await Address.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        res.status(200).json({
            message: "Address updated successfully",
            data: updatedAddress
        });
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getAddressById = async (req, res) => {
    try {
        const { user_id } = req.params;
        console.log("user_id", user_id);
        
        const addresses = await Address.find({ user: user_id });
        console.log("addresses", addresses);
        if (!addresses || addresses.length === 0) {
            return res.status(404).json({ message: "No addresses found for this user" });
        }

        res.status(200).json({ message: "Addresses retrieved successfully", data: addresses });
    } catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({});
        res.status(200).json({
            message: "All addresses retrieved successfully",
            data: addresses
        });
    } catch (error) {
        console.error("Error fetching all addresses:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};