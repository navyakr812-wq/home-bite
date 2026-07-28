"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addChefReview = exports.updateChefProfile = exports.getChefById = exports.getChefs = void 0;
const Chef_1 = require("../models/Chef");
const FoodItem_1 = require("../models/FoodItem");
const Review_1 = require("../models/Review");
const getChefs = async (req, res) => {
    try {
        const chefs = await Chef_1.Chef.find({ isActive: true }).populate('user', 'name');
        res.json(chefs);
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving chefs', error });
    }
};
exports.getChefs = getChefs;
const getChefById = async (req, res) => {
    try {
        const chef = await Chef_1.Chef.findById(req.params.id).populate('user', 'name');
        if (!chef)
            return res.status(404).json({ message: 'Chef not found' });
        const menu = await FoodItem_1.FoodItem.find({ chef: chef._id });
        const reviews = await Review_1.Review.find({ chef: chef._id }).populate('reviewer', 'name');
        res.json({ chef, menu, reviews });
    }
    catch (error) {
        res.status(500).json({ message: 'Error retrieving chef details', error });
    }
};
exports.getChefById = getChefById;
const updateChefProfile = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { bio, avatarUrl, coverImageUrl, specialties, deliveryTime } = req.body;
        const chef = await Chef_1.Chef.findOne({ user: req.user.id });
        if (!chef)
            return res.status(404).json({ message: 'Chef profile not found' });
        chef.bio = bio ?? chef.bio;
        chef.avatarUrl = avatarUrl ?? chef.avatarUrl;
        chef.coverImageUrl = coverImageUrl ?? chef.coverImageUrl;
        chef.specialties = specialties ?? chef.specialties;
        chef.deliveryTime = deliveryTime ?? chef.deliveryTime;
        await chef.save();
        res.json(chef);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating chef profile', error });
    }
};
exports.updateChefProfile = updateChefProfile;
const addChefReview = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        const { rating, comment } = req.body;
        const chefId = req.params.id;
        const review = new Review_1.Review({
            reviewer: req.user.id,
            chef: chefId,
            rating,
            comment
        });
        await review.save();
        // Update Chef average rating
        const chef = await Chef_1.Chef.findById(chefId);
        if (chef) {
            const allReviews = await Review_1.Review.find({ chef: chefId });
            const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            chef.rating = parseFloat(avg.toFixed(1));
            chef.reviewsCount = allReviews.length;
            await chef.save();
        }
        res.status(201).json(review);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating review', error });
    }
};
exports.addChefReview = addChefReview;
