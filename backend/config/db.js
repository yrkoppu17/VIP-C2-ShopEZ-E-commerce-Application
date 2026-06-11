import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';

const seedInMemoryData = async () => {
  try {
    const usersData = [
      {
        name: 'Admin User',
        email: 'admin@shopez.com',
        password: 'admin123',
        role: 'admin',
        address: { street: '100 Admin Way', city: 'Silicon Valley', postalCode: '94025', country: 'USA' }
      },
      {
        name: 'John Doe',
        email: 'john@gmail.com',
        password: '123456',
        role: 'customer',
        address: { street: '123 Main St', city: 'New York', postalCode: '10001', country: 'USA' }
      }
    ];

    const productsData = [
      {
        name: 'ShopEZ Sonic Headphones',
        description: 'Immersive sound experience with active noise cancellation, comfortable over-ear design, and 40 hours of battery life.',
        price: 129.99,
        category: 'Electronics',
        stockQuantity: 25,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'],
        averageRating: 4.5,
        numReviews: 2
      },
      {
        name: 'EZ-Fit Smart Watch',
        description: 'Track your fitness, monitor heart rate, sleep quality, and receive calls/texts directly. Swimproof with 7-day battery life.',
        price: 199.99,
        category: 'Electronics',
        stockQuantity: 15,
        images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'],
        averageRating: 4.0,
        numReviews: 1
      },
      {
        name: 'Minimalist Leather Backpack',
        description: 'Crafted from full-grain leather, featuring a padded laptop compartment, water-resistant zippers, and multiple utility pockets.',
        price: 89.99,
        category: 'Fashion',
        stockQuantity: 10,
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'],
        averageRating: 5.0,
        numReviews: 3
      },
      {
        name: 'Active Runner Sneakers',
        description: 'Lightweight running shoes built with breathable knit upper, responsive foam cushioning, and high-traction rubber outsole.',
        price: 75.50,
        category: 'Fashion',
        stockQuantity: 30,
        images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'],
        averageRating: 4.2,
        numReviews: 5
      },
      {
        name: 'Ergonomic Desk Chair',
        description: 'Breathable mesh back, adjustable lumbar support, headrest, 3D armrests, and dynamic recline tilt tension lock.',
        price: 249.99,
        category: 'Home & Living',
        stockQuantity: 8,
        images: ['https://images.unsplash.com/photo-1580481072645-022f9a6dbf27?w=800&auto=format&fit=crop&q=80'],
        averageRating: 4.7,
        numReviews: 4
      },
      {
        name: 'Double-Walled Steel Tumbler',
        description: 'Keep drinks ice cold for 24 hours or steaming hot for 12. Complete with leak-proof straw lid and premium matte grip finish.',
        price: 24.99,
        category: 'Home & Living',
        stockQuantity: 50,
        images: ['https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=800&auto=format&fit=crop&q=80'],
        averageRating: 4.8,
        numReviews: 10
      }
    ];

    await User.deleteMany();
    await Product.deleteMany();

    await User.insertMany(usersData);
    await Product.insertMany(productsData);
    console.log('In-Memory Database Seeded with Mock Data!');
  } catch (err) {
    console.error('Error seeding in-memory database:', err.message);
  }
};

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000, // 3 seconds timeout
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`Local MongoDB connection failed: ${error.message}`);
    console.log('Starting In-Memory MongoDB Fallback...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      console.log(`In-Memory MongoDB Started at ${uri}`);

      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Connected (In-Memory): ${conn.connection.host}`);

      await seedInMemoryData();
    } catch (memError) {
      console.error(`Fallback failed: ${memError.message}`);
      console.log('Could not load memory-server. Exiting server.');
      process.exit(1);
    }
  }
};

export default connectDB;
