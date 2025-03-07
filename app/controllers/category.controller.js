import { Category } from "../models/category.model.js";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true });
    // console.log("categories", categories);
    res.status(200).json({ categories });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong... please try again later" });
  }
};

// Get a single category by ID
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params.id;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Something went wrong... please try again later" });
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
    if (existingCategory) {
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
    res.status(500).json({
      message: "Something went wrong... please try again later",
    });
  }
};

// Update a category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params.id;
    const updates = req.body;

    const category = await Category.findByIdAndUpdate(id, updates, {
      new: true,
    });

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

// Delete a category (soft delete by setting isActive to false)
// export const deleteCategory = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Check if there are products using this category
//     const productsWithCategory = await Product.countDocuments({
//       category: id,
//       isActive: true,
//     });

//     if (productsWithCategory > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot delete this category because it is used by ${productsWithCategory} product(s). Please reassign or delete these products first.`,
//       });
//     }

//     const category = await Category.findByIdAndUpdate(
//       id,
//       { isActive: false },
//       { new: true }
//     );

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Category deleted successfully",
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong... please try again later",
//       error: err.message,
//     });
//   }
// };

// Permanently delete a category (for admin use only)
// export const permanentlyDeleteCategory = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Check if there are products using this category
//     const productsWithCategory = await Product.countDocuments({ category: id });

//     if (productsWithCategory > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot delete this category because it is used by ${productsWithCategory} product(s). Please reassign or delete these products first.`,
//       });
//     }

//     const category = await Category.findByIdAndDelete(id);

//     if (!category) {
//       return res.status(404).json({
//         success: false,
//         message: "Category not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Category permanently deleted",
//     });
//   } catch (err) {
//     res.status(500).json({
//       success: false,
//       message: "Something went wrong... please try again later",
//       error: err.message,
//     });
//   }
// };
