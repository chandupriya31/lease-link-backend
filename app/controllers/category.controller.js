import { Category } from "../models/category.model.js";

// Get all categories
export const getAllCategories = async (req, res) => {
  // console.log("Fetching all active categories");
  try {
    const categories = await Category.find({ isActive: true });
    // console.log(`Found ${categories.length} active categories`);

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

// Get a single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Getting category with ID:", id);

    // Find the category and make sure it's active
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

// Create a new category
export const createCategory = async (req, res) => {
  try {
    console.log("body-cat", req.body);
    const { name, description, icon } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        message: "Please provide category name",
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name });
    console.log("existingCategory", existingCategory);

    if (existingCategory) {
      // If it exists but is inactive, reactivate it instead of creating new
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

      // If it's already active, return error
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    // Create new category
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

// Update a category
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

// Delete a category (soft delete)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting category with ID:", id);

    // Find the category by ID and set isActive to false (soft delete)
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
