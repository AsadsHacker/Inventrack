import connectToDatabase from '../utils/db.js';
import StockIn from '../models/StockIn.js';
import StockOut from '../models/StockOut.js';
import StockTransfer from '../models/StockTransfer.js';
import Item from '../models/Item.js';
import Location from '../models/Location.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  try {
    await connectToDatabase();

    if (req.method === 'GET') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Run all independent queries in parallel to eliminate sequential network latency delays
      const [
        totalInAgg, totalOutAgg, 
        dailyInAgg, dailyOutAgg, 
        locationCount, 
        items, allStockIn, allStockOut, 
        recentIn, recentOut, recentTransfer
      ] = await Promise.all([
        StockIn.aggregate([{ $group: { _id: null, total: { $sum: '$qtyReceived' } } }]),
        StockOut.aggregate([{ $group: { _id: null, total: { $sum: '$qtyIssued' } } }]),
        StockIn.aggregate([{ $match: { createdAt: { $gte: today, $lt: tomorrow } } }, { $group: { _id: null, total: { $sum: '$qtyReceived' } } }]),
        StockOut.aggregate([{ $match: { createdAt: { $gte: today, $lt: tomorrow } } }, { $group: { _id: null, total: { $sum: '$qtyIssued' } } }]),
        Location.countDocuments({}),
        Item.find({}).populate('category', 'categoryName').populate('unit', 'unitName'),
        StockIn.aggregate([{ $group: { _id: '$itemName', total: { $sum: '$qtyReceived' } } }]),
        StockOut.aggregate([{ $group: { _id: '$itemName', total: { $sum: '$qtyIssued' } } }]),
        StockIn.find({}).populate('itemName', 'itemName').populate('location', 'locationName').sort({ createdAt: -1 }).limit(10).lean(),
        StockOut.find({}).populate('itemName', 'itemName').populate('location', 'locationName').sort({ createdAt: -1 }).limit(10).lean(),
        StockTransfer.find({}).populate('itemName', 'itemName').populate('fromLocation', 'locationName').populate('toLocation', 'locationName').sort({ createdAt: -1 }).limit(10).lean()
      ]);

      const totalIn = totalInAgg[0]?.total || 0;
      const totalOut = totalOutAgg[0]?.total || 0;
      const totalStock = totalIn - totalOut;

      const dailyIn = dailyInAgg[0]?.total || 0;
      const dailyOut = dailyOutAgg[0]?.total || 0;

      // Create quick lookup maps for low stock items
      const inMap = allStockIn.reduce((acc, curr) => { 
        if(curr._id) acc[curr._id.toString()] = curr.total; 
        return acc; 
      }, {});
      
      const outMap = allStockOut.reduce((acc, curr) => { 
        if(curr._id) acc[curr._id.toString()] = curr.total; 
        return acc; 
      }, {});

      const lowStockItems = [];
      for (const item of items) {
        const itemId = item._id.toString();
        const currentStock = (inMap[itemId] || 0) - (outMap[itemId] || 0);
        if (currentStock <= item.minimumStockLevel) {
          lowStockItems.push({ 
            _id: item._id, 
            itemName: item.itemName, 
            currentStock, 
            minimumStockLevel: item.minimumStockLevel 
          });
        }
      }

      // Recent activity mapping

      const combined = [
        ...recentIn.map(r => ({ date: r.createdAt, type: 'IN', item: r.itemName?.itemName || 'N/A', qty: r.qtyReceived, location: r.location?.locationName || 'N/A', ref: r.grnNo })),
        ...recentOut.map(r => ({ date: r.createdAt, type: 'OUT', item: r.itemName?.itemName || 'N/A', qty: r.qtyIssued, location: r.location?.locationName || 'N/A', ref: r.issueNo })),
        ...recentTransfer.map(r => ({ date: r.createdAt, type: 'TRANSFER', item: r.itemName?.itemName || 'N/A', qty: r.qtyTransferred, location: `${r.fromLocation?.locationName || '?'} → ${r.toLocation?.locationName || '?'}`, ref: r.transferNo })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);

      return res.status(200).json({
        totalStock,
        lowStockCount: lowStockItems.length,
        lowStockItems,
        dailyIn,
        dailyOut,
        locationCount,
        recentActivity: combined,
      });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
