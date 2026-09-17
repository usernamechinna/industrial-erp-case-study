const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { calculateQuotationTotal, canCreateOrderFromQuotation, ensureUniqueOrderPerQuotation, validateReservation } = require('../utils/stock');
const { seedProducts, seedInventory } = require('../utils/seed');

const router = express.Router();

const enquiries = [
  {
    id: 1,
    enquiryNumber: 'ENQ-1001',
    customer: 'ABC Engineering Pvt. Ltd.',
    status: 'NEW',
    items: [
      { productId: 1, quantity: 100 },
      { productId: 2, quantity: 40 },
      { productId: 3, quantity: 200 }
    ]
  }
];

const quotations = [
  {
    id: 1,
    quotationNumber: 'QTN-2001',
    enquiryId: 1,
    customer: 'ABC Engineering Pvt. Ltd.',
    status: 'ACCEPTED',
    items: [
      { productId: 1, quantity: 100, unitPrice: 1250, discountPercent: 5, gstPercent: 18 },
      { productId: 2, quantity: 40, unitPrice: 980, discountPercent: 10, gstPercent: 18 }
    ]
  }
];

const orders = [];

router.get('/', requireAuth, requireRole('ADMIN', 'SALES_USER'), (_req, res) => {
  res.json(enquiries);
});

router.post('/', requireAuth, requireRole('SALES_USER'), (req, res) => {
  const { customer, items, enquiryNumber, requiredDate } = req.body || {};

  if (!customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Customer and enquiry items are required' });
  }

  const enquiry = {
    id: enquiries.length + 1,
    enquiryNumber: enquiryNumber || `ENQ-${Date.now()}`,
    customer,
    status: 'NEW',
    requiredDate,
    items
  };

  enquiries.push(enquiry);
  return res.status(201).json(enquiry);
});

router.get('/quotations', requireAuth, requireRole('ADMIN', 'SALES_USER'), (_req, res) => {
  res.json(quotations);
});

router.post('/quotations', requireAuth, requireRole('SALES_USER'), (req, res) => {
  const { enquiryId, customer, items } = req.body || {};
  if (!enquiryId || !customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Quotation payload is invalid' });
  }

  const grandTotal = calculateQuotationTotal(items);
  const quotation = {
    id: quotations.length + 1,
    quotationNumber: `QTN-${Date.now()}`,
    enquiryId,
    customer,
    status: 'DRAFT',
    items,
    grandTotal
  };

  quotations.push(quotation);
  return res.status(201).json(quotation);
});

router.patch('/quotations/:id/status', requireAuth, requireRole('ADMIN', 'SALES_USER'), (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const quotation = quotations.find(item => item.id === Number(id));

  if (!quotation) {
    return res.status(404).json({ message: 'Quotation not found' });
  }

  quotation.status = status;
  return res.json(quotation);
});

router.post('/quotations/:id/convert', requireAuth, requireRole('SALES_USER'), (req, res) => {
  const { id } = req.params;
  const quotation = quotations.find(item => item.id === Number(id));

  if (!quotation) {
    return res.status(404).json({ message: 'Quotation not found' });
  }

  if (!canCreateOrderFromQuotation(quotation.status)) {
    return res.status(400).json({ message: 'Only ACCEPTED quotations can be converted into sales orders' });
  }

  if (!ensureUniqueOrderPerQuotation(orders, quotation.id)) {
    return res.status(409).json({ message: 'This quotation already has an active sales order' });
  }

  const order = {
    id: orders.length + 1,
    quotationId: quotation.id,
    orderNumber: `SO-${Date.now()}`,
    customer: quotation.customer,
    status: 'PENDING',
    totalAmount: quotation.grandTotal,
    items: quotation.items
  };

  orders.push(order);
  return res.status(201).json(order);
});

router.get('/sales-orders', requireAuth, requireRole('ADMIN', 'SALES_USER'), (_req, res) => {
  res.json(orders.map((order) => ({ ...order, available: seedInventory }))); 
});

router.post('/sales-orders/:id/confirm', requireAuth, requireRole('ADMIN'), (req, res) => {
  const { id } = req.params;
  const order = orders.find(item => item.id === Number(id));

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  const requestedByProduct = order.items.reduce((acc, item) => {
    acc[item.productId] = (acc[item.productId] || 0) + Number(item.quantity || 0);
    return acc;
  }, {});

  for (const [productId, requestedQty] of Object.entries(requestedByProduct)) {
    const inventory = seedInventory.find(row => row.productId === Number(productId));
    const validation = validateReservation(inventory || { physicalQuantity: 0, reservedQuantity: 0 }, requestedQty);
    if (!validation.allowed) {
      return res.status(409).json({ message: validation.message, productId });
    }
  }

  for (const [productId, requestedQty] of Object.entries(requestedByProduct)) {
    const inventory = seedInventory.find(row => row.productId === Number(productId));
    if (!inventory) continue;
    inventory.reservedQuantity = Number(inventory.reservedQuantity || 0) + Number(requestedQty);
  }

  order.status = 'CONFIRMED';
  return res.json(order);
});

router.post('/sales-orders/:id/dispatch', requireAuth, requireRole('ADMIN'), (req, res) => {
  const { id } = req.params;
  const order = orders.find(item => item.id === Number(id));

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.status !== 'CONFIRMED') {
    return res.status(400).json({ message: 'Only confirmed orders can be dispatched' });
  }

  for (const item of order.items) {
    const inventory = seedInventory.find(row => row.productId === Number(item.productId));
    if (!inventory) {
      return res.status(409).json({ message: `Inventory missing for product ${item.productId}` });
    }
    const reservedAfter = Number(inventory.reservedQuantity || 0) - Number(item.quantity || 0);
    if (reservedAfter < 0) {
      return res.status(409).json({ message: 'Dispatch exceeds reserved quantity' });
    }
    inventory.reservedQuantity = reservedAfter;
    inventory.physicalQuantity = Number(inventory.physicalQuantity || 0) - Number(item.quantity || 0);
  }

  order.status = 'DISPATCHED';
  return res.json(order);
});

module.exports = router;
