import { Category } from "../models/category.model.js";


export const getAllCategories = async (req, res) => {

  try {
    const categories = await Category.find({ isActive: true });
    
    return res.status(200).json({
      success: true,
      categories,
      count: categories.length,
    });
  } catch (err) {
    console.error("Get all categories error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong... please try again later",
    });
  }
};


export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Getting category with ID:", id);

    
    const category = await Category.findOne({ _id: id, isActive: true });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      category,
    });
  } catch (err) {
    console.error("Get category by ID error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong... please try again later",
    });
  }
};


export const createCategory = async (req, res) => {
  try {
    const { name, description, icon } = req.body;

    
    if (!name) {
      return res.status(400).json({
        message: "Please provide category name",
      });
    }

    
    const existingCategory = await Category.findOne({ name });
    console.log("existingCategory", existingCategory);

    if (existingCategory) {
     
      if (!existingCategory.isActive) {
        existingCategory.isActive = true;
        existingCategory.description =
          description || existingCategory.description;
        existingCategory.icon = icon || existingCategory.icon;

        const updatedCategory = await existingCategory.save();

        return res.status(200).json({
          success: true,
          message: "Category reactivated successfully",
          category: updatedCategory,
        });
      }

     
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    
    const category = await Category.create({
      name,
      description,
      icon,
      isActive: true,
    });

    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } catch (err) {
    console.error("Create category error:", err);
    res.status(500).json({
      message: "Something went wrong... please try again later",
    });
  }
};


export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id in categories", id);
    const updates = req.body;
    console.log("updates", updates);
    const category = await Category.findByIdAndUpdate(id, updates, {
      new: true,
    });
    console.log("category in updateCategory", category);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.status(200).json({
      message: "Category updated successfully",
      category,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong... please try again later",
    });
  }
};


export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting category with ID:", id);

    
    const category = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    console.error("Delete category error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong... please try again later",
    });
  }
};
