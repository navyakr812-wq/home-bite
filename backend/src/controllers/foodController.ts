import { Request, Response } from 'express';
import { FoodItem } from '../models/FoodItem';
import { Chef } from '../models/Chef';
import { AuthRequest } from '../middleware/auth';

export const getFoodItems = async (req: Request, res: Response) => {
  try {
    const { category, search, chefId } = req.query;
    const query: any = {};

    // For customers, show only available items. For admins/chefs, we might show all, but default is available
    if (req.headers.authorization) {
      // Keep it simple: if chefId is passed, filter by chef. If not admin or chef dashboard, filter available
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search as string, $options: 'i' };
    }

    if (chefId) {
      query.chef = chefId;
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
    const { name, description, price, imageUrl, category, prepTime, ingredients, vegIndicator, isAvailable, chefId } = req.body;

    let targetChefId;

    if (req.user.role === 'admin') {
      if (!chefId) return res.status(400).json({ message: 'chefId is required for admin to create food item' });
      targetChefId = chefId;
    } else {
      const chef = await Chef.findOne({ user: req.user.id });
      if (!chef) return res.status(403).json({ message: 'Only registered chefs can add dishes' });
      targetChefId = chef._id;
    }

    const foodItem = new FoodItem({
      name,
      description,
      price: Number(price),
      imageUrl: imageUrl || '',
      category,
      chef: targetChefId,
      prepTime: prepTime || '20-30 mins',
      ingredients: Array.isArray(ingredients) ? ingredients : (ingredients ? ingredients.split(',').map((s: string) => s.trim()) : []),
      vegIndicator: vegIndicator || 'Veg',
      isAvailable: isAvailable !== undefined ? isAvailable : true
    });

    await foodItem.save();
    res.status(201).json(foodItem);
  } catch (error) {
    res.status(500).json({ message: 'Error adding dish', error });
  }
};

export const updateFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { name, description, price, imageUrl, category, prepTime, ingredients, vegIndicator, isAvailable } = req.body;

    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Dish not found' });

    // Permissions check
    if (req.user.role !== 'admin') {
      const chef = await Chef.findOne({ user: req.user.id });
      if (!chef || item.chef.toString() !== chef._id.toString()) {
        return res.status(403).json({ message: 'Access denied: You do not own this dish' });
      }
    }

    item.name = name !== undefined ? name : item.name;
    item.description = description !== undefined ? description : item.description;
    item.price = price !== undefined ? Number(price) : item.price;
    item.imageUrl = imageUrl !== undefined ? imageUrl : item.imageUrl;
    item.category = category !== undefined ? category : item.category;
    item.prepTime = prepTime !== undefined ? prepTime : item.prepTime;
    item.vegIndicator = vegIndicator !== undefined ? vegIndicator : item.vegIndicator;
    item.isAvailable = isAvailable !== undefined ? isAvailable : item.isAvailable;
    
    if (ingredients !== undefined) {
      item.ingredients = Array.isArray(ingredients) ? ingredients : ingredients.split(',').map((s: string) => s.trim());
    }

    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error updating dish', error });
  }
};

export const deleteFoodItem = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const item = await FoodItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Dish not found' });

    // Permissions check
    if (req.user.role !== 'admin') {
      const chef = await Chef.findOne({ user: req.user.id });
      if (!chef || item.chef.toString() !== chef._id.toString()) {
        return res.status(403).json({ message: 'Access denied: You do not own this dish' });
      }
    }

    await FoodItem.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dish deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting dish', error });
  }
};
