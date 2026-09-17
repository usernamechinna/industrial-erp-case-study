function calculateLineAmount({ quantity, unitPrice, discountPercent = 0, gstPercent = 0 }) {
  const baseAmount = Number(quantity) * Number(unitPrice);
  const discountValue = baseAmount * (Number(discountPercent || 0) / 100);
  const discountedAmount = baseAmount - discountValue;
  const gstValue = discountedAmount * (Number(gstPercent || 0) / 100);
  return discountedAmount + gstValue;
}

function calculateQuotationTotal(items) {
  return items.reduce((total, item) => total + calculateLineAmount(item), 0);
}

function computeAvailable({ physicalQuantity, reservedQuantity }) {
  return Number(physicalQuantity) - Number(reservedQuantity);
}

function canCreateOrderFromQuotation(quotationStatus) {
  return quotationStatus === 'ACCEPTED';
}

function ensureUniqueOrderPerQuotation(existingOrders, quotationId) {
  return !existingOrders.some((order) => order.quotationId === quotationId && order.status !== 'CANCELLED');
}

function validateReservation(inventory, requestedQuantity) {
  const available = computeAvailable(inventory);
  if (Number(requestedQuantity) <= 0) {
    return { allowed: false, message: 'Quantity must be greater than zero' };
  }
  if (Number(requestedQuantity) > available) {
    return {
      allowed: false,
      message: `Reservation exceeds available stock. Requested ${requestedQuantity}, available ${available}`
    };
  }
  return { allowed: true, available };
}

function validateDispatch(inventory, requestedQuantity) {
  const reserved = Number(inventory.reservedQuantity || 0);
  if (Number(requestedQuantity) <= 0) {
    return { allowed: false, message: 'Dispatch quantity must be greater than zero' };
  }
  if (Number(requestedQuantity) > reserved) {
    return {
      allowed: false,
      message: `Dispatch exceeds reserved stock. Requested ${requestedQuantity}, reserved ${reserved}`
    };
  }
  return { allowed: true, reserved };
}

function authorizeRole(currentUser, allowedRoles) {
  return !!currentUser && allowedRoles.includes(currentUser.role);
}

module.exports = {
  calculateLineAmount,
  calculateQuotationTotal,
  computeAvailable,
  canCreateOrderFromQuotation,
  ensureUniqueOrderPerQuotation,
  validateReservation,
  validateDispatch,
  authorizeRole
};
