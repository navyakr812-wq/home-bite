"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFoodItem = exports.createFoodItem = exports.getFoodById = exports.getFoodItems = void 0;
const FoodItem_1 = require("../models/FoodItem");
const Chef_1 = require("../models/Chef");
const getFoodItems = async (req, res) => {
    try {
        const { category, search } = req.query;
        const query = { isAvailable: true };
        if (category) {
            query.category = category;
        }
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        const items = await FoodItem_1.FoodItem.find(query).populate({
            path: 'chef',
            populate: { path: 'user', select: 'name' }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving dishes', error });
    }
};
exports.getFoodItems = getFoodItems;
const getFoodById = async (req, res) => {
    try {
        const item = await FoodItem_1.FoodItem.findById(req.params.id).populate({
            path: 'chef',
            populate: { path: 'user', select: 'name' }
        });
        if (!item)
            return res.status(404).json({ message: 'Dish not found' });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving dish', error });
    }
};
exports.getFoodById = getFoodById;
const createFoodItem = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { name, description, price, imageUrl, category, prepTime } = req.body;
        const chef = await Chef_1.Chef.findOne({ user: req.user.id });
        if (!chef)
            return res.status(403).json({ message: 'Only registered chefs can add dishes' });
        const foodItem = new FoodItem_1.FoodItem({
            name,
            description,
            price,
            imageUrl,
            category,
            chef: chef._id,
            prepTime
        });
        await foodItem.save();
        res.status(201).json(foodItem);
    }
    catch (error) {
        res.status(500).json({ message: 'Error adding dish', error });
    }
};
exports.createFoodItem = createFoodItem;
const deleteFoodItem = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const chef = await Chef_1.Chef.findOne({ user: req.user.id });
        if (!chef)
            return res.status(403).json({ message: 'Access denied' });
        const item = await FoodItem_1.FoodItem.findOneAndDelete({ _id: req.params.id, chef: chef._id });
        if (!item)
            return res.status(404).json({ message: 'Dish not found or not owned by you' });
        res.json({ message: 'Dish deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting dish', error });
    }
};
exports.deleteFoodItem = deleteFoodItem;
