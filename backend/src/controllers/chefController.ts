import { Request, Response } from 'express';
import { Chef } from '../models/Chef';
import { FoodItem } from '../models/FoodItem';
import { Review } from '../models/Review';
import { AuthRequest } from '../middleware/auth';

export const getChefs = async (req: Request, res: Response) => {
  try {
    const chefs = await Chef.find({ isActive: true }).populate('user', 'name');
    res.json(chefs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chefs', error });
  }
};

export const getChefById = async (req: Request, res: Response) => {
  try {
    const chef = await Chef.findById(req.params.id).populate('user', 'name');
    if (!chef) return res.status(404).json({ message: 'Chef not found' });

    const menu = await FoodItem.find({ chef: chef._id });
    const reviews = await Review.find({ chef: chef._id }).populate('reviewer', 'name');

    res.json({ chef, menu, reviews });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving chef details', error });
  }
};

export const updateChefProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { bio, avatarUrl, coverImageUrl, specialties, deliveryTime } = req.body;

    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) return res.status(404).json({ message: 'Chef profile not found' });

    chef.bio = bio ?? chef.bio;
    chef.avatarUrl = avatarUrl ?? chef.avatarUrl;
    chef.coverImageUrl = coverImageUrl ?? chef.coverImageUrl;
    chef.specialties = specialties ?? chef.specialties;
    chef.deliveryTime = deliveryTime ?? chef.deliveryTime;

    await chef.save();
    res.json(chef);
  } catch (error) {
    res.status(500).json({ message: 'Error updating chef profile', error });
  }
};

export const addChefReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { rating, comment } = req.body;
    const chefId = req.params.id;

    const review = new Review({
      reviewer: req.user.id,
      chef: chefId,
      rating,
      comment
    });
    await review.save();

    // Update Chef average rating
    const chef = await Chef.findById(chefId);
    if (chef) {
      const allReviews = await Review.find({ chef: chefId });
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      chef.rating = parseFloat(avg.toFixed(1));
      chef.reviewsCount = allReviews.length;
      await chef.save();
    }

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error });
  }
};
