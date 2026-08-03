const axios = require('axios');

const API_URL = 'https://home-bite-backend-ww95.onrender.com/api';

async function verifyProduction() {
  console.log('Testing live production backend at:', API_URL);
  
  try {
    // 1. Admin login
    console.log('Logging in as admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@homebite.com',
      password: 'admin123'
    });
    const token = loginRes.data.token;
    console.log('Login successful! Admin Token acquired.');

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Add Chef
    console.log('Creating a new chef...');
    const chefPayload = {
      name: 'Chef Gordon',
      email: `gordon.${Date.now()}@homebite.com`,
      password: 'gordonpassword123',
      bio: 'Michelin star home cook specializing in British and French cuisine.',
      cuisine: 'French',
      specialties: ['Lunch', 'Dinner'],
      deliveryTime: '25-35 mins',
      avatarUrl: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
      coverImageUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800',
      contact: '+15559876543'
    };

    const chefRes = await axios.post(`${API_URL}/chefs`, chefPayload, { headers });
    const chefId = chefRes.data.chef._id;
    console.log(`Chef created successfully with ID: ${chefId}`);

    // 3. Verify Chef exists in GET /api/chefs
    console.log('Fetching chefs directory...');
    const getChefsRes = await axios.get(`${API_URL}/chefs`);
    const chefs = getChefsRes.data;
    const foundChef = chefs.find(c => c._id === chefId);
    if (foundChef) {
      console.log('✓ Successfully verified: Chef appears in public directory.');
    } else {
      throw new Error('Verification failed: Chef not found in public directory.');
    }

    // 4. Add Food/Dish for Chef
    console.log('Adding a dish for the chef...');
    const dishPayload = {
      name: 'Beef Wellington',
      description: 'Tender beef fillet wrapped in puff pastry with mushroom duxelles.',
      price: 1599,
      category: 'Dinner',
      vegIndicator: 'Non-Veg',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500',
      prepTime: '45 mins',
      ingredients: 'Beef tenderloin, puff pastry, mushrooms, prosciutto',
      allergens: 'Gluten, Dairy',
      discount: 0,
      isAvailable: true,
      chefId: chefId
    };

    const dishRes = await axios.post(`${API_URL}/food`, dishPayload, { headers });
    const dishId = dishRes.data._id;
    console.log(`Dish created successfully with ID: ${dishId}`);

    // 5. Verify Dish exists in GET /api/food
    console.log('Fetching dishes list...');
    const getFoodRes = await axios.get(`${API_URL}/food`);
    const foodItems = getFoodRes.data;
    const foundDish = foodItems.find(f => f._id === dishId);
    if (foundDish) {
      console.log('✓ Successfully verified: Dish appears in food list.');
    } else {
      throw new Error('Verification failed: Dish not found in food list.');
    }

    console.log('All production verification tests passed successfully!');
  } catch (error) {
    console.error('Production verification failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

verifyProduction();
