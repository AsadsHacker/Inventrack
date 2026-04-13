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

  const { id } = req.query;

  try {
    await connectToDatabase();

    if (req.method === 'PUT') {
      const { unitName } = req.body;
      
      if (!unitName) {
        return res.status(400).json({ error: 'Unit name is required' });
      }

      const updatedUnit = await Unit.findByIdAndUpdate(
        id,
        { unitName: unitName.toUpperCase() },
        { new: true, runValidators: true }
      );

      if (!updatedUnit) {
        return res.status(404).json({ error: 'Unit not found' });
      }

      return res.status(200).json(updatedUnit);
    }

    if (req.method === 'DELETE') {
      // Mock validation logic for later
      // We will assume it's valid to delete for now.
      
      const deletedUnit = await Unit.findByIdAndDelete(id);
      
      if (!deletedUnit) {
        return res.status(404).json({ error: 'Unit not found' });
      }

      return res.status(200).json({ message: 'Unit deleted successfully', id });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Unit name already exists' });
    }
    return res.status(500).json({ error: error.message });
  }
}
