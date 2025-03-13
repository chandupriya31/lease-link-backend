import { Insurance } from "../models/insurance.model.js";


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


export const getInsurancePlanIdsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    const insurancePlans = await Insurance.find(
      { userId, is_active: true },
      { userId,_id: 1,plan_name:1,description:1,price:1,features:1 } 
    );

    if (!insurancePlans.length) {
      return res.status(404).json({
        success: false,
        message: "No active insurance plans found",
      });
    }

    
    const insurancePlansData = insurancePlans.map(plan => ({
      userId:userId,
      plan_id: plan._id,
      plan_name: plan.plan_name,
      description: plan.description,
      price: plan.price,
      features: plan.features,
    }));
  

    return res.status(200).json({
      success: true,
      insurancePlans:insurancePlansData
    });
  } catch (error) {
    console.error("Error fetching insurance plan IDs:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
};



export const createInsurancePlan = async (req, res) => {
  try {
    const { userId, plan_name, description, price, features } = req.body;

    if (!userId || !plan_name || !description || !price) {
      return res.status(400).json({
        success: false,
        message: "Please provide plan name, description, and price",
      });
    }

    const existingPlan = await Insurance.findOne({ userId, plan_name });

    if (existingPlan) {
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

      return res.status(400).json({
        success: false,
        message: "Insurance plan with this name already exists for this user",
      });
    }

    const insurancePlan = await Insurance.create({
      userId,
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





export const updateInsurancePlan = async (req, res) => {
  try {
    const { Id } = req.params;
    const updates = req.body;
    console.log("updates", updates);
    const insurancePlan = await Insurance.findByIdAndUpdate(Id, updates, {
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


export const deleteInsurancePlan = async (req, res) => {
  try {
    const { id } = req.params;

    
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
