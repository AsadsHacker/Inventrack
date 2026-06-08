import connectToDatabase from '../utils/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const users = await User.find({}).select('-password').sort({ createdAt: -1 });
      return res.status(200).json(users);
    }

    if (req.method === 'POST') {
      const { username, password, role } = req.body;
      if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

      const last = await User.findOne().sort({ userId: -1 });
      let nextNum = 1;
      if (last?.userId?.startsWith('USR-')) {
        const n = parseInt(last.userId.split('-')[1]);
        if (!isNaN(n)) nextNum = n + 1;
      }
      const userId = `USR-${nextNum.toString().padStart(2, '0')}`;

      // Hash password with bcryptjs before storing
      const hashed = await bcrypt.hash(password, 10);
      const doc = new User({ userId, username, password: hashed, role: role || 'Viewer' });
      await doc.save();
      const safe = doc.toObject();
      delete safe.password;
      return res.status(201).json(safe);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Username already exists' });
    return res.status(500).json({ error: error.message });
  }
}
