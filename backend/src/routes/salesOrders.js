const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { calculateQuotationTotal, canCreateOrderFromQuotation, ensureUniqueOrderPerQuotation } = require('../utils/stock');
const { enquiries, quotations, salesOrders } = require('../data/store');

const router = express.Router();

router.get('/', requireAuth, requireRole('ADMIN', 'SALES_USER'), (_req, res) => {
  res.json(quotations);
});

router.post('/', requireAuth, requireRole('SALES_USER'), (req, res) => {
  const { enquiryId, customer, items } = req.body || {};
  if (!enquiryId || !customer || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Quotation payload is invalid' });
  }

  const enquiry = enquiries.find((entry) => entry.id === Number(enquiryId));
  if (!enquiry) {
    return res.status(404).json({ message: 'Enquiry not found' });
  }

  const validItems = items.every((item) => Number(item.quantity) > 0 && item.productId && Number(item.unitPrice) >= 0);
  if (!validItems) {
    return res.status(400).json({ message: 'Each quotation item must include a valid productId, quantity, and unitPrice' });
  }

  const quotation = {
    id: quotations.length + 1,
    quotationNumber: `QTN-${Date.now()}`,
    enquiryId: Number(enquiryId),
    customer,
    status: 'DRAFT',
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    items,
    grandTotal: calculateQuotationTotal(items)
  };

  quotations.push(quotation);
  const enquiryIndex = enquiries.findIndex((entry) => entry.id === Number(enquiryId));
  if (enquiryIndex >= 0) enquiries[enquiryIndex].status = 'QUOTED';

  return res.status(201).json(quotation);
});

router.patch('/:id/status', requireAuth, requireRole('ADMIN', 'SALES_USER'), (req, res) => {
  const { id } = req.params;
  const { status } = req.body || {};
  const quotation = quotations.find((entry) => entry.id === Number(id));

  if (!quotation) {
    return res.status(404).json({ message: 'Quotation not found' });
  }

  quotation.status = status;
  return res.json(quotation);
});

router.post('/:id/convert', requireAuth, requireRole('SALES_USER'), (req, res) => {
  const { id } = req.params;
  const quotation = quotations.find((entry) => entry.id === Number(id));

  if (!quotation) {
    return res.status(404).json({ message: 'Quotation not found' });
  }

  if (!canCreateOrderFromQuotation(quotation.status)) {
    return res.status(400).json({ message: 'Only ACCEPTED quotations can be converted into sales orders' });
  }

  if (!ensureUniqueOrderPerQuotation(salesOrders, quotation.id)) {
    return res.status(409).json({ message: 'This quotation already has an active sales order' });
  }

  const order = {
    id: salesOrders.length + 1,
    quotationId: quotation.id,
    orderNumber: `SO-${Date.now()}`,
    customer: quotation.customer,
    status: 'PENDING',
    totalAmount: quotation.grandTotal,
    items: quotation.items,
    orderDate: new Date().toISOString()
  };

  salesOrders.push(order);
  return res.status(201).json(order);
});

module.exports = router;
