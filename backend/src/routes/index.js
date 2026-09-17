const express = require('express');
const authRoutes = require('./auth');
const productRoutes = require('./products');
const enquiryRoutes = require('./enquiries');
const quotationRoutes = require('./quotations');
const salesOrderRoutes = require('./salesOrders');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/enquiries', enquiryRoutes);
router.use('/quotations', quotationRoutes);
router.use('/sales-orders', salesOrderRoutes);

module.exports = router;
