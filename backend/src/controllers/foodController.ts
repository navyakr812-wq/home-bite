import { Request, Response } from 'express';
import { FoodItem } from '../models/FoodItem';
import { Chef } from '../models/Chef';
import { AuthRequest } from '../middleware/auth';

export const getFoodItems = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const query: any = { isAvailable: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search as string, $options: 'i' };
    }

    const items = await FoodItem.find(query).populate({
      path: 'chef',
      populate: { path: 'user', select: 'name' }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving dishes', error });
  }
};

export const getFoodById = async (req: Request, res: Response) => {
  try {
    const item = await FoodItem.findById(req.params.id).populate({
      path: 'chef',
      populate: { path: 'user', select: 'name' }
    });
    if (!item) return res.status(404).json({ message: 'Dish not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving dish', error });
  }
};

export const createFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { name, description, price, imageUrl, category, prepTime } = req.body;

    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) return res.status(403).json({ message: 'Only registered chefs can add dishes' });

    const foodItem = new FoodItem({
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
  } catch (error) {
    res.status(500).json({ message: 'Error adding dish', error });
  }
};

export const deleteFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const chef = await Chef.findOne({ user: req.user.id });
    if (!chef) return res.status(403).json({ message: 'Access denied' });

    const item = await FoodItem.findOneAndDelete({ _id: req.params.id, chef: chef._id });
    if (!item) return res.status(404).json({ message: 'Dish not found or not owned by you' });

    res.json({ message: 'Dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting dish', error });
  }
};
