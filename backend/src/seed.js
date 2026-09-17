const bcrypt = require('bcryptjs');
const { sequelize, User, Product, Inventory } = require('./models');

const products = [
  ['IP-A', 'Industrial Product A', 'Machinery', 'pcs', 1250, 200],
  ['IP-B', 'Industrial Product B', 'Machinery', 'pcs', 980, 140],
  ['IP-C', 'Industrial Product C', 'Consumables', 'pcs', 760, 300],
  ['IP-D', 'Industrial Product D', 'Safety', 'pcs', 320, 120],
  ['IP-E', 'Industrial Product E', 'Control', 'pcs', 450, 180],
  ['IP-F', 'Industrial Product F', 'Maintenance', 'pcs', 550, 220]
];

async function seed() {
  await sequelize.sync();
  await User.findOrCreate({ where: { email: 'admin@erp.local' }, defaults: { name: 'Admin User', passwordHash: await bcrypt.hash('Admin@123', 10), role: 'ADMIN' } });
  await User.findOrCreate({ where: { email: 'sales@erp.local' }, defaults: { name: 'Sales User', passwordHash: await bcrypt.hash('Sales@123', 10), role: 'SALES_USER' } });

  for (const [productCode, productName, category, unit, basePrice, physicalQuantity] of products) {
    const [product] = await Product.findOrCreate({ where: { productCode }, defaults: { productName, category, unit, basePrice } });
    await Inventory.findOrCreate({ where: { productId: product.id }, defaults: { physicalQuantity, reservedQuantity: 0 } });
  }
  console.log('Database synchronized and seed data loaded');
}

seed().catch(error => { console.error(error); process.exitCode = 1; });
