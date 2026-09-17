const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { validateReservation } = require('../utils/stock');
const { inventory, salesOrders, dispatches } = require('../data/store');

const router = express.Router();

router.get('/', requireAuth, requireRole('ADMIN', 'SALES_USER'), (_req, res) => {
  res.json(salesOrders);
});

router.post('/:id/confirm', requireAuth, requireRole('ADMIN'), (req, res) => {
  const { id } = req.params;
  const order = salesOrders.find((entry) => entry.id === Number(id));

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.status === 'CANCELLED') {
    return res.status(400).json({ message: 'Cancelled orders cannot be confirmed' });
  }

  const requestedByProduct = order.items.reduce((acc, item) => {
    acc[item.productId] = (acc[item.productId] || 0) + Number(item.quantity || 0);
    return acc;
  }, {});

  for (const [productId, requestedQty] of Object.entries(requestedByProduct)) {
    const stock = inventory.find((entry) => entry.productId === Number(productId));
    if (!stock) {
      return res.status(409).json({ message: `Inventory missing for product ${productId}` });
    }

    const validation = validateReservation(stock, requestedQty);
    if (!validation.allowed) {
      return res.status(409).json({ message: validation.message, productId });
    }
  }

  for (const [productId, requestedQty] of Object.entries(requestedByProduct)) {
    const stock = inventory.find((entry) => entry.productId === Number(productId));
    stock.reservedQuantity = Number(stock.reservedQuantity) + Number(requestedQty);
  }

  order.status = 'CONFIRMED';
  return res.json(order);
});

router.post('/:id/dispatch', requireAuth, requireRole('ADMIN'), (req, res) => {
  const { id } = req.params;
  const { vehicleNumber, driverName } = req.body || {};
  const order = salesOrders.find((entry) => entry.id === Number(id));

  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }

  if (order.status === 'CANCELLED') {
    return res.status(400).json({ message: 'Cancelled orders cannot be dispatched' });
  }

  if (order.status !== 'CONFIRMED') {
    return res.status(400).json({ message: 'Only confirmed orders can be dispatched' });
  }

  for (const item of order.items) {
    const stock = inventory.find((entry) => entry.productId === Number(item.productId));
    if (!stock) {
      return res.status(409).json({ message: `Inventory missing for product ${item.productId}` });
    }

    const qty = Number(item.quantity || 0);
    if (qty > Number(stock.reservedQuantity)) {
      return res.status(409).json({ message: `Dispatch exceeds reserved quantity for product ${item.productId}` });
    }

    stock.physicalQuantity = Number(stock.physicalQuantity) - qty;
    stock.reservedQuantity = Number(stock.reservedQuantity) - qty;
  }

  order.status = 'DISPATCHED';
  const dispatch = {
    id: dispatches.length + 1,
    dispatchNumber: `DIS-${Date.now()}`,
    salesOrderId: order.id,
    dispatchDate: new Date().toISOString(),
    vehicleNumber: vehicleNumber || 'N/A',
    driverName: driverName || 'N/A',
    items: order.items
  };

  dispatches.push(dispatch);
  return res.status(201).json({ order, dispatch });
});

module.exports = router;
