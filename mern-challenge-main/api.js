import express from 'express';
import fetch from 'node-fetch';
import Product from '../models/Product.js';

const router = express.Router();

// Route to initialize the database
router.get('/initialize', async (req, res) => {
  const response = await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
  const data = await response.json();

  await Product.insertMany(data);
  res.send('Database initialized with seed data');
});

// Route to list all transactions
router.get('/transactions', async (req, res) => {
  const { month, search, page = 1, perPage = 10 } = req.query;
  const query = { dateOfSale: { $regex: new RegExp(`-${month.padStart(2, '0')}-`) } };

  if (search) {
    query.$or = [
      { title: { $regex: new RegExp(search, 'i') } },
      { description: { $regex: new RegExp(search, 'i') } },
      { price: Number(search) }
    ];
  }

  const transactions = await Product.find(query)
    .skip((page - 1) * perPage)
    .limit(Number(perPage));

  res.json(transactions);
});

// Route to get statistics
router.get('/statistics', async (req, res) => {
  const { month } = req.query;
  const regex = new RegExp(`-${month.padStart(2, '0')}-`);

  const transactions = await Product.find({ dateOfSale: { $regex: regex } });

  const totalSaleAmount = transactions.reduce((sum, transaction) => sum + transaction.price, 0);
  const totalSoldItems = transactions.length;
  const totalNotSoldItems = await Product.countDocuments() - totalSoldItems;

  res.json({ totalSaleAmount, totalSoldItems, totalNotSoldItems });
});

// Route to get bar chart data
router.get('/barchart', async (req, res) => {
  const { month } = req.query;
  const regex = new RegExp(`-${month.padStart(2, '0')}-`);

  const transactions = await Product.find({ dateOfSale: { $regex: regex } });

  const priceRanges = [
    { range: '0-100', count: 0 },
    { range: '101-200', count: 0 },
    { range: '201-300', count: 0 },
    { range: '301-400', count: 0 },
    { range: '401-500', count: 0 },
    { range: '501-600', count: 0 },
    { range: '601-700', count: 0 },
    { range: '701-800', count: 0 },
    { range: '801-900', count: 0 },
    { range: '901-above', count: 0 },
  ];

  transactions.forEach(transaction => {
    const price = transaction.price;
    if (price <= 100) priceRanges[0].count++;
    else if (price <= 200) priceRanges[1].count++;
    else if (price <= 300) priceRanges[2].count++;
    else if (price <= 400) priceRanges[3].count++;
    else if (price <= 500) priceRanges[4].count++;
    else if (price <= 600) priceRanges[5].count++;
    else if (price <= 700) priceRanges[6].count++;
    else if (price <= 800) priceRanges[7].count++;
    else if (price <= 900) priceRanges[8].count++;
    else priceRanges[9].count++;
  });

  res.json(priceRanges);
});

// Route to get pie chart data
router.get('/piechart', async (req, res) => {
  const { month } = req.query;
  const regex = new RegExp(`-${month.padStart(2, '0')}-`);

  const transactions = await Product.find({ dateOfSale: { $regex: regex } });

  const categoryCount = transactions.reduce((acc, transaction) => {
    acc[transaction.category] = (acc[transaction.category] || 0) + 1;
    return acc;
  }, {});

  res.json(categoryCount);
});

// Route to get combined data
router.get('/combined', async (req, res) => {
  const { month } = req.query;

  const [transactions, statistics, barchart, piechart] = await Promise.all([
    fetch(`http://localhost:5000/api/transactions?month=${month}`).then(res => res.json()),
    fetch(`http://localhost:5000/api/statistics?month=${month}`).then(res => res.json()),
    fetch(`http://localhost:5000/api/barchart?month=${month}`).then(res => res.json()),
    fetch(`http://localhost:5000/api/piechart?month=${month}`).then(res => res.json())
  ]);

  res.json({ transactions, statistics, barchart, piechart });
});

export default router;
