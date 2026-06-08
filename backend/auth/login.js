import connectToDatabase from '../utils/db.js';
import User from '../models/User.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await connectToDatabase();
    const bcrypt = await import('bcrypt');
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    // Seed default admin if no users exist
    const count = await User.countDocuments({});
    if (count === 0) {
      const hashed = await bcrypt.default.hash('Admin@123', 10);
      await new User({ userId: 'USR-ADMIN', username: 'admin', password: hashed, role: 'Admin' }).save();
    }

    const user = await User.findOne({ username, isActive: true });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Compare with bcrypt — fallback to plain text for legacy accounts
    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.default.compare(password, user.password);
    } catch {
      // If bcrypt fails (not a hash), try plain text match
      passwordMatch = (user.password === password);
    }
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Simple token (in production use JWT)
    const token = Buffer.from(JSON.stringify({ id: user._id, username: user.username, role: user.role })).toString('base64');

    return res.status(200).json({ token, user: { _id: user._id, userId: user.userId, username: user.username, role: user.role } });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
