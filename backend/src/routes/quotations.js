const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { enquiries, inventory } = require('../data/store');

const router = express.Router();

router.get('/', requireAuth, requireRole('ADMIN', 'SALES_USER'), (_req, res) => {
  res.json(enquiries);
});

router.post('/', requireAuth, requireRole('SALES_USER'), (req, res) => {
  const { customer, enquiryNumber, requiredDate, notes, items } = req.body || {};

  if (!customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Customer and enquiry items are required' });
  }

  const validItems = items.every((item) => Number(item.quantity) > 0 && item.productId);
  if (!validItems) {
    return res.status(400).json({ message: 'Each enquiry item must include a valid productId and positive quantity' });
  }

  const enquiry = {
    id: enquiries.length + 1,
    enquiryNumber: enquiryNumber || `ENQ-${Date.now()}`,
    customer,
    enquiryDate: new Date().toISOString().slice(0, 10),
    requiredDate: requiredDate || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    status: 'NEW',
    notes: notes || '',
    items
  };

  enquiries.push(enquiry);
  return res.status(201).json(enquiry);
});

router.get('/availability', requireAuth, requireRole('ADMIN', 'SALES_USER'), (_req, res) => {
  res.json(
    inventory.map((row) => ({
      productId: row.productId,
      physicalQuantity: Number(row.physicalQuantity),
      reservedQuantity: Number(row.reservedQuantity),
      availableQuantity: Number(row.physicalQuantity) - Number(row.reservedQuantity)
    }))
  );
});

module.exports = router;
