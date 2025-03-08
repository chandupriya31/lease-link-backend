import { Insurance } from "../models/insurance.model.js";

// Get all insurance plans
export const getAllInsurancePlans = async (req, res) => {
  try {
    const insurancePlans = await Insurance.find({ is_active: true });

    return res.status(200).json({
      success: true,
      insurancePlans,
      count: insurancePlans.length,
    });
  } catch (err) {
    console.error("Get all insurance plans error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong... please try again later",
    });
  }
};

// Get a single insurance plan by ID
export const getInsurancePlanById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the insurance plan and make sure it's active
    const insurancePlan = await Insurance.findOne({ _id: id, is_active: true });

    if (!insurancePlan) {
      return res.status(404).json({
        success: false,
        message: "Insurance plan not found",
      });
    }

    res.status(200).json({
      success: true,
      insurancePlan,
    });
  } catch (err) {
    console.error("Get insurance plan by ID error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong... please try again later",
    });
  }
};

// Create a new insurance plan
export const createInsurancePlan = async (req, res) => {
  try {
    const { plan_name, description, price, features } = req.body;

    // Validate required fields
    if (!plan_name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide plan name, description, and price",
      });
    }

    // Check if a plan with the same name already exists
    const existingPlan = await Insurance.findOne({ plan_name });

    if (existingPlan) {
      // If it exists but is inactive, reactivate it instead of creating new
      if (!existingPlan.is_active) {
        existingPlan.is_active = true;
        existingPlan.description = description || existingPlan.description;
        existingPlan.price = price || existingPlan.price;
        existingPlan.features = features || existingPlan.features;

        const updatedPlan = await existingPlan.save();

        return res.status(200).json({
          success: true,
          message: "Insurance plan reactivated successfully",
          insurancePlan: updatedPlan,
        });
      }

      // If it's already active, return error
      return res.status(400).json({
        success: false,
        message: "Insurance plan with this name already exists",
      });
    }

    // Create new insurance plan
    const insurancePlan = await Insurance.create({
      plan_name,
      description,
      price,
      features,
      is_active: true,
    });

    res.status(201).json({
      success: true,
      message: "Insurance plan created successfully",
      insurancePlan,
    });
  } catch (err) {
    console.error("Create insurance plan error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong... please try again later",
    });
  }
};

// Update an insurance plan
export const updateInsurancePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    console.log("updates", updates);
    const insurancePlan = await Insurance.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!insurancePlan) {
      return res.status(404).json({
        success: false,
        message: "Insurance plan not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Insurance plan updated successfully",
      insurancePlan,
    });
  } catch (err) {
    console.error("Update insurance plan error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong... please try again later",
    });
  }
};

// Delete an insurance plan (soft delete)
export const deleteInsurancePlan = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the insurance plan by ID and set is_active to false (soft delete)
    const insurancePlan = await Insurance.findByIdAndUpdate(
      id,
      { is_active: false },
      { new: true }
    );

    if (!insurancePlan) {
      return res.status(404).json({
        success: false,
        message: "Insurance plan not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Insurance plan deleted successfully",
    });
  } catch (err) {
    console.error("Delete insurance plan error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong... please try again later",
    });
  }
};
