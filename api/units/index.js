import connectToDatabase from '../utils/db.js';
import Unit from '../models/Unit.js';

export default async function handler(req, res) {
  // CORS caching headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const units = await Unit.find({}).sort({ createdAt: -1 });
      return res.status(200).json(units);
    }

    if (req.method === 'POST') {
      const { unitName } = req.body;

      if (!unitName) {
        return res.status(400).json({ error: 'Unit name is required' });
      }

      // Generate Auto ID UN-XX
      const lastUnit = await Unit.findOne().sort({ recordId: -1 });
      let nextNum = 1;
      
      if (lastUnit && lastUnit.recordId && lastUnit.recordId.startsWith('UN-')) {
        const lastNum = parseInt(lastUnit.recordId.split('-')[1]);
        if (!isNaN(lastNum)) {
          nextNum = lastNum + 1;
        }
      }
      
      const recordId = `UN-${nextNum.toString().padStart(2, '0')}`;

      const newUnit = new Unit({
        recordId,
        unitName: unitName.toUpperCase()
      });

      await newUnit.save();
      return res.status(201).json(newUnit);
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Unit name already exists' });
    }
    return res.status(500).json({ error: error.message });
  }
}
