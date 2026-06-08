import connectToDatabase from '../utils/db.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await connectToDatabase();
    const { username, password } = req.body;
    console.log('Login attempt:', username);

    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

    // Seed default admin if no users exist at all
    const count = await User.countDocuments({});
    if (count === 0) {
      const hashed = await bcrypt.hash('Admin@123', 10);
      await new User({ userId: 'USR-ADMIN', username: 'admin', password: hashed, role: 'Admin', isActive: true }).save();
      console.log('Admin seeded (no users existed)');
    }

    const user = await User.findOne({ username, isActive: true });
    console.log('User found:', user ? 'YES' : 'NO');

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    // Check password — support both bcrypt hashed and legacy plain text
    let passwordMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      // Password is bcrypt hashed
      passwordMatch = await bcrypt.compare(password, user.password);
      console.log('Bcrypt compare result:', passwordMatch);
    } else {
      // Legacy plain text password — compare directly, then upgrade to hash
      passwordMatch = (user.password === password);
      console.log('Plain text compare result:', passwordMatch);
      if (passwordMatch) {
        // Upgrade to bcrypt hash for next time
        const hashed = await bcrypt.hash(password, 10);
        await User.updateOne({ _id: user._id }, { password: hashed });
        console.log('Upgraded plain text password to bcrypt hash for:', username);
      }
    }

    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // Simple base64 token
    const token = Buffer.from(JSON.stringify({ id: user._id, username: user.username, role: user.role })).toString('base64');

    return res.status(200).json({ token, user: { _id: user._id, userId: user.userId, username: user.username, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: error.message });
  }
}
