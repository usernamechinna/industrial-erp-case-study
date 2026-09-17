const bcrypt = require('bcryptjs');

const seedUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@erp.local',
    passwordHash: bcrypt.hashSync('Admin@123', 10),
    role: 'ADMIN'
  },
  {
    id: 2,
    name: 'Sales User',
    email: 'sales@erp.local',
    passwordHash: bcrypt.hashSync('Sales@123', 10),
    role: 'SALES_USER'
  }
];

const seedProducts = [
  { id: 1, productCode: 'IP-A', productName: 'Industrial Product A', category: 'Machinery', unit: 'pcs', basePrice: 1250 },
  { id: 2, productCode: 'IP-B', productName: 'Industrial Product B', category: 'Machinery', unit: 'pcs', basePrice: 980 },
  { id: 3, productCode: 'IP-C', productName: 'Industrial Product C', category: 'Consumables', unit: 'pcs', basePrice: 760 },
  { id: 4, productCode: 'IP-D', productName: 'Industrial Product D', category: 'Safety', unit: 'pcs', basePrice: 320 },
  { id: 5, productCode: 'IP-E', productName: 'Industrial Product E', category: 'Control', unit: 'pcs', basePrice: 450 },
  { id: 6, productCode: 'IP-F', productName: 'Industrial Product F', category: 'Maintenance', unit: 'pcs', basePrice: 550 }
];

const seedInventory = [
  { productId: 1, physicalQuantity: 200, reservedQuantity: 60 },
  { productId: 2, physicalQuantity: 140, reservedQuantity: 20 },
  { productId: 3, physicalQuantity: 300, reservedQuantity: 80 },
  { productId: 4, physicalQuantity: 120, reservedQuantity: 35 },
  { productId: 5, physicalQuantity: 180, reservedQuantity: 50 },
  { productId: 6, physicalQuantity: 220, reservedQuantity: 40 }
];

module.exports = { seedUsers, seedProducts, seedInventory };
