const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(120), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
  role: { type: DataTypes.ENUM('ADMIN', 'SALES_USER'), allowNull: false, defaultValue: 'SALES_USER' }
}, { tableName: 'users', underscored: true, timestamps: true });

const Customer = sequelize.define('Customer', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  companyName: { type: DataTypes.STRING(180), allowNull: false, field: 'company_name' },
  contactPerson: { type: DataTypes.STRING(120), allowNull: false, field: 'contact_person' },
  mobile: { type: DataTypes.STRING(30), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, validate: { isEmail: true } },
  city: { type: DataTypes.STRING(80), allowNull: false }
}, { tableName: 'customers', underscored: true, timestamps: true });

const Product = sequelize.define('Product', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  productCode: { type: DataTypes.STRING(50), allowNull: false, unique: true, field: 'product_code' },
  productName: { type: DataTypes.STRING(180), allowNull: false, field: 'product_name' },
  category: { type: DataTypes.STRING(100), allowNull: false },
  unit: { type: DataTypes.STRING(30), allowNull: false },
  basePrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'base_price', validate: { min: 0 } }
}, { tableName: 'products', underscored: true, timestamps: true });

const Inventory = sequelize.define('Inventory', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  productId: { type: DataTypes.BIGINT, allowNull: false, unique: true, field: 'product_id' },
  physicalQuantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0, field: 'physical_quantity', validate: { min: 0 } },
  reservedQuantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false, defaultValue: 0, field: 'reserved_quantity', validate: { min: 0 } }
}, { tableName: 'inventory', underscored: true, timestamps: true });

Inventory.prototype.getAvailableQuantity = function getAvailableQuantity() {
  return Number(this.physicalQuantity) - Number(this.reservedQuantity);
};

const Enquiry = sequelize.define('Enquiry', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  enquiryNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true, field: 'enquiry_number' },
  customerId: { type: DataTypes.BIGINT, allowNull: false, field: 'customer_id' },
  createdBy: { type: DataTypes.BIGINT, allowNull: false, field: 'created_by' },
  enquiryDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'enquiry_date' },
  requiredDate: { type: DataTypes.DATEONLY, allowNull: false, field: 'required_date' },
  status: { type: DataTypes.ENUM('NEW', 'QUOTED', 'WON', 'LOST'), allowNull: false, defaultValue: 'NEW' },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'enquiries', underscored: true, timestamps: true });

const EnquiryItem = sequelize.define('EnquiryItem', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  enquiryId: { type: DataTypes.BIGINT, allowNull: false, field: 'enquiry_id' },
  productId: { type: DataTypes.BIGINT, allowNull: false, field: 'product_id' },
  quantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false, validate: { min: 0.001 } },
  notes: { type: DataTypes.TEXT }
}, { tableName: 'enquiry_items', underscored: true, timestamps: false });

const Quotation = sequelize.define('Quotation', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  quotationNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true, field: 'quotation_number' },
  enquiryId: { type: DataTypes.BIGINT, allowNull: false, unique: true, field: 'enquiry_id' },
  customerId: { type: DataTypes.BIGINT, allowNull: false, field: 'customer_id' },
  createdBy: { type: DataTypes.BIGINT, allowNull: false, field: 'created_by' },
  validUntil: { type: DataTypes.DATEONLY, allowNull: false, field: 'valid_until' },
  status: { type: DataTypes.ENUM('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'), allowNull: false, defaultValue: 'DRAFT' },
  grandTotal: { type: DataTypes.DECIMAL(14, 2), allowNull: false, defaultValue: 0, field: 'grand_total' }
}, { tableName: 'quotations', underscored: true, timestamps: true });

const QuotationItem = sequelize.define('QuotationItem', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  quotationId: { type: DataTypes.BIGINT, allowNull: false, field: 'quotation_id' },
  productId: { type: DataTypes.BIGINT, allowNull: false, field: 'product_id' },
  quantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false, validate: { min: 0.001 } },
  unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'unit_price', validate: { min: 0 } },
  discountPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0, field: 'discount_percent', validate: { min: 0, max: 100 } },
  gstPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0, field: 'gst_percent', validate: { min: 0, max: 100 } },
  lineTotal: { type: DataTypes.DECIMAL(14, 2), allowNull: false, field: 'line_total', validate: { min: 0 } }
}, { tableName: 'quotation_items', underscored: true, timestamps: false });

const SalesOrder = sequelize.define('SalesOrder', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  orderNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true, field: 'order_number' },
  quotationId: { type: DataTypes.BIGINT, allowNull: false, unique: true, field: 'quotation_id' },
  customerId: { type: DataTypes.BIGINT, allowNull: false, field: 'customer_id' },
  createdBy: { type: DataTypes.BIGINT, allowNull: false, field: 'created_by' },
  orderDate: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW, field: 'order_date' },
  status: { type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'DISPATCHED', 'CANCELLED'), allowNull: false, defaultValue: 'PENDING' },
  totalAmount: { type: DataTypes.DECIMAL(14, 2), allowNull: false, field: 'total_amount', validate: { min: 0 } }
}, { tableName: 'sales_orders', underscored: true, timestamps: true });

const SalesOrderItem = sequelize.define('SalesOrderItem', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  salesOrderId: { type: DataTypes.BIGINT, allowNull: false, field: 'sales_order_id' },
  productId: { type: DataTypes.BIGINT, allowNull: false, field: 'product_id' },
  quantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false, validate: { min: 0.001 } },
  unitPrice: { type: DataTypes.DECIMAL(12, 2), allowNull: false, field: 'unit_price', validate: { min: 0 } }
}, { tableName: 'sales_order_items', underscored: true, timestamps: false });

const Dispatch = sequelize.define('Dispatch', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  dispatchNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true, field: 'dispatch_number' },
  salesOrderId: { type: DataTypes.BIGINT, allowNull: false, field: 'sales_order_id' },
  dispatchDate: { type: DataTypes.DATE, allowNull: false, defaultValue: Sequelize.NOW, field: 'dispatch_date' },
  vehicleNumber: { type: DataTypes.STRING(40), allowNull: false, field: 'vehicle_number' },
  driverName: { type: DataTypes.STRING(120), allowNull: false, field: 'driver_name' }
}, { tableName: 'dispatches', underscored: true, timestamps: true });

const DispatchItem = sequelize.define('DispatchItem', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  dispatchId: { type: DataTypes.BIGINT, allowNull: false, field: 'dispatch_id' },
  productId: { type: DataTypes.BIGINT, allowNull: false, field: 'product_id' },
  quantity: { type: DataTypes.DECIMAL(12, 3), allowNull: false, validate: { min: 0.001 } }
}, { tableName: 'dispatch_items', underscored: true, timestamps: false });

User.hasMany(Enquiry, { foreignKey: 'createdBy', as: 'enquiries' });
User.hasMany(Quotation, { foreignKey: 'createdBy', as: 'quotations' });
User.hasMany(SalesOrder, { foreignKey: 'createdBy', as: 'salesOrders' });
Customer.hasMany(Enquiry, { foreignKey: 'customerId', as: 'enquiries' });
Customer.hasMany(Quotation, { foreignKey: 'customerId', as: 'quotations' });
Customer.hasMany(SalesOrder, { foreignKey: 'customerId', as: 'salesOrders' });
Enquiry.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Enquiry.hasMany(EnquiryItem, { foreignKey: 'enquiryId', as: 'items', onDelete: 'CASCADE' });
EnquiryItem.belongsTo(Enquiry, { foreignKey: 'enquiryId' });
EnquiryItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasOne(Inventory, { foreignKey: 'productId', as: 'inventory', onDelete: 'CASCADE' });
Inventory.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Enquiry.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Quotation.belongsTo(Enquiry, { foreignKey: 'enquiryId', as: 'enquiry' });
Quotation.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Quotation.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
Quotation.hasMany(QuotationItem, { foreignKey: 'quotationId', as: 'items', onDelete: 'CASCADE' });
QuotationItem.belongsTo(Quotation, { foreignKey: 'quotationId' });
QuotationItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Quotation.hasOne(SalesOrder, { foreignKey: 'quotationId', as: 'salesOrder' });
SalesOrder.belongsTo(Quotation, { foreignKey: 'quotationId', as: 'quotation' });
SalesOrder.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
SalesOrder.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });
SalesOrder.hasMany(SalesOrderItem, { foreignKey: 'salesOrderId', as: 'items', onDelete: 'CASCADE' });
SalesOrderItem.belongsTo(SalesOrder, { foreignKey: 'salesOrderId' });
SalesOrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
SalesOrder.hasMany(Dispatch, { foreignKey: 'salesOrderId', as: 'dispatches' });
Dispatch.belongsTo(SalesOrder, { foreignKey: 'salesOrderId', as: 'salesOrder' });
Dispatch.hasMany(DispatchItem, { foreignKey: 'dispatchId', as: 'items', onDelete: 'CASCADE' });
DispatchItem.belongsTo(Dispatch, { foreignKey: 'dispatchId' });
DispatchItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = {
  sequelize,
  User,
  Customer,
  Product,
  Inventory,
  Enquiry,
  EnquiryItem,
  Quotation,
  QuotationItem,
  SalesOrder,
  SalesOrderItem,
  Dispatch,
  DispatchItem
};
