// controllers/menuController.js
import MenuItem from "../models/MenuItem.js";

// @desc    Get all available menu items
// @route   GET /api/menu
// @access  Public
export const getMenu = async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).sort({
      category: 1,
      name: 1,
    });
    res.json(items);
  } catch (error) {
    console.error("Error fetching menu:", error.message);
    res.status(500).json({ message: "Failed to fetch menu" });
  }
};

// @desc    Create a menu item
// @route   POST /api/menu
// @access  Protected — admin, manager, waiter, accountant
export const createMenuItem = async (req, res) => {
  try {
    const { name, description, price, category, imageUrl } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const item = await MenuItem.create({
      name,
      description: description || "",
      price,
      category: category || "main",
      imageUrl: imageUrl || null,
    });

    res.status(201).json(item);
  } catch (error) {
    console.error("Error creating menu item:", error.message);
    res.status(500).json({ message: "Failed to create menu item" });
  }
};
