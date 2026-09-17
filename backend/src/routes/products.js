const express = require('express');
const { seedProducts, seedInventory } = require('../utils/seed');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();

router.get('/', requireAuth, requireRole('ADMIN', 'SALES_USER'), (_req, res) => {
  res.json({ products: seedProducts, inventory: seedInventory });
});

router.get('/available', requireAuth, requireRole('ADMIN', 'SALES_USER'), (_req, res) => {
  const rows = seedProducts.map((product) => {
    const inventory = seedInventory.find(row => row.productId === product.id) || { physicalQuantity: 0, reservedQuantity: 0 };
    return {
      productId: product.id,
      productCode: product.productCode,
      productName: product.productName,
      physicalQuantity: inventory.physicalQuantity,
      reservedQuantity: inventory.reservedQuantity,
      availableQuantity: Math.max(0, Number(inventory.physicalQuantity) - Number(inventory.reservedQuantity))
    };
  });

  res.json(rows);
});

module.exports = router;
