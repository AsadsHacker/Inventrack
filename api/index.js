import express from 'express';
import cors from 'cors';
import connectToDatabase from '../backend/utils/db.js';
import User from '../backend/models/User.js';

// Auth
import loginHandler from '../backend/auth/login.js';
// Models
import unitsIndex from '../backend/units/index.js';
import unitsId from '../backend/units/[id].js';
import categoriesIndex from '../backend/categories/index.js';
import categoriesId from '../backend/categories/[id].js';
import suppliersIndex from '../backend/suppliers/index.js';
import suppliersId from '../backend/suppliers/[id].js';
import locationsIndex from '../backend/locations/index.js';
import locationsId from '../backend/locations/[id].js';
import itemsIndex from '../backend/items/index.js';
import itemsId from '../backend/items/[id].js';
import stockinIndex from '../backend/stockin/index.js';
import stockinId from '../backend/stockin/[id].js';
import stockoutIndex from '../backend/stockout/index.js';
import stockoutId from '../backend/stockout/[id].js';
import stocktransferIndex from '../backend/stocktransfer/index.js';
import stocktransferId from '../backend/stocktransfer/[id].js';
import usersIndex from '../backend/users/index.js';
import usersId from '../backend/users/[id].js';
import dashboardIndex from '../backend/dashboard/index.js';
import reportsIndex from '../backend/reports/index.js';

// --- Auto-create default admin on cold start ---
const createDefaultAdmin = async () => {
  try {
    const bcrypt = await import('bcrypt');
    const existing = await User.findOne({ username: 'admin' });
    if (!existing) {
      const hashed = await bcrypt.default.hash('Admin@123', 10);
      await User.create({
        userId: 'USR-ADMIN',
        username: 'admin',
        password: hashed,
        role: 'Admin',
        isActive: true
      });
      console.log('Default admin created successfully');
    }
  } catch (err) {
    console.error('Admin creation error:', err);
  }
};

// Connect to DB and seed admin on cold start
connectToDatabase().then(() => {
  console.log('MongoDB connected');
  createDefaultAdmin();
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const app = express();

app.use(cors());
app.use(express.json());

// Helper wrapper to map Express req.params to Vercel req.query
const wrap = (handler) => {
  return (req, res) => {
    // Vercel Serverless combines query and route params into req.query
    req.query = { ...req.query, ...req.params };
    return handler(req, res);
  };
};

// Auth
app.all('/api/auth/login', wrap(loginHandler));

// Units
app.all('/api/units', wrap(unitsIndex));
app.all('/api/units/:id', wrap(unitsId));

// Categories
app.all('/api/categories', wrap(categoriesIndex));
app.all('/api/categories/:id', wrap(categoriesId));

// Suppliers
app.all('/api/suppliers', wrap(suppliersIndex));
app.all('/api/suppliers/:id', wrap(suppliersId));

// Locations
app.all('/api/locations', wrap(locationsIndex));
app.all('/api/locations/:id', wrap(locationsId));

// Items
app.all('/api/items', wrap(itemsIndex));
app.all('/api/items/:id', wrap(itemsId));

// Stock In
app.all('/api/stockin', wrap(stockinIndex));
app.all('/api/stockin/:id', wrap(stockinId));

// Stock Out
app.all('/api/stockout', wrap(stockoutIndex));
app.all('/api/stockout/:id', wrap(stockoutId));

// Stock Transfer
app.all('/api/stocktransfer', wrap(stocktransferIndex));
app.all('/api/stocktransfer/:id', wrap(stocktransferId));

// Users
app.all('/api/users', wrap(usersIndex));
app.all('/api/users/:id', wrap(usersId));

// Dashboard
app.all('/api/dashboard', wrap(dashboardIndex));

// Reports
app.all('/api/reports', wrap(reportsIndex));

// Export default handler for Vercel Serverless Runtime
export default function handler(req, res) {
  return app(req, res);
}
