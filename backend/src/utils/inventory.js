const { Op } = require('sequelize');
const { Inventory } = require('../models');

function availableQuantity(inventory) {
  return Number(inventory.physicalQuantity) - Number(inventory.reservedQuantity);
}

function assertPositiveQuantity(quantity) {
  if (!Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
    const error = new Error('Quantity must be greater than zero');
    error.status = 400;
    throw error;
  }
}

async function getAvailableQuantity(productId, transaction) {
  const inventory = await Inventory.findOne({ where: { productId }, transaction });
  if (!inventory) return null;
  return availableQuantity(inventory);
}

async function reserveInventory(productId, quantity, transaction) {
  assertPositiveQuantity(quantity);
  const inventory = await Inventory.findOne({
    where: { productId },
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  if (!inventory) {
    const error = new Error(`Inventory not found for product ${productId}`);
    error.status = 404;
    throw error;
  }

  const available = availableQuantity(inventory);
  if (Number(quantity) > available) {
    const error = new Error(`Insufficient stock for product ${productId}. Requested ${quantity}, available ${available}`);
    error.status = 409;
    throw error;
  }

  inventory.reservedQuantity = Number(inventory.reservedQuantity) + Number(quantity);
  await inventory.save({ transaction });
  return inventory;
}

async function dispatchReservedInventory(productId, quantity, transaction) {
  assertPositiveQuantity(quantity);
  const inventory = await Inventory.findOne({
    where: { productId },
    transaction,
    lock: transaction.LOCK.UPDATE
  });

  if (!inventory) {
    const error = new Error(`Inventory not found for product ${productId}`);
    error.status = 404;
    throw error;
  }
  if (Number(quantity) > Number(inventory.reservedQuantity)) {
    const error = new Error(`Dispatch exceeds reserved quantity for product ${productId}`);
    error.status = 409;
    throw error;
  }
  if (Number(quantity) > Number(inventory.physicalQuantity)) {
    const error = new Error(`Physical quantity cannot become negative for product ${productId}`);
    error.status = 409;
    throw error;
  }

  inventory.physicalQuantity = Number(inventory.physicalQuantity) - Number(quantity);
  inventory.reservedQuantity = Number(inventory.reservedQuantity) - Number(quantity);
  await inventory.save({ transaction });
  return inventory;
}

module.exports = { availableQuantity, getAvailableQuantity, reserveInventory, dispatchReservedInventory, assertPositiveQuantity };
