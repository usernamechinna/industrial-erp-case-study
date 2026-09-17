const { calculateQuotationTotal, canCreateOrderFromQuotation, ensureUniqueOrderPerQuotation, validateReservation, authorizeRole } = require('../utils/stock');

describe('ERP business rules', () => {
  test('Quotation total is calculated correctly', () => {
    const items = [
      { quantity: 100, unitPrice: 1250, discountPercent: 5, gstPercent: 18 },
      { quantity: 40, unitPrice: 980, discountPercent: 10, gstPercent: 18 }
    ];

    const total = calculateQuotationTotal(items);
    expect(total).toBeGreaterThan(0);
    expect(total).toBeCloseTo(115926.0, 1);
  });

  test('Rejected or draft quotation cannot create a sales order', () => {
    expect(canCreateOrderFromQuotation('DRAFT')).toBe(false);
    expect(canCreateOrderFromQuotation('REJECTED')).toBe(false);
    expect(canCreateOrderFromQuotation('ACCEPTED')).toBe(true);
  });

  test('Same quotation cannot generate duplicate sales orders', () => {
    const existingOrders = [
      { quotationId: 4, status: 'PENDING' },
      { quotationId: 4, status: 'CANCELLED' }
    ];

    expect(ensureUniqueOrderPerQuotation(existingOrders, 4)).toBe(false);
    expect(ensureUniqueOrderPerQuotation(existingOrders, 7)).toBe(true);
  });

  test('Cannot reserve more than available inventory', () => {
    const inventory = { physicalQuantity: 100, reservedQuantity: 30 };
    const result = validateReservation(inventory, 81);

    expect(result.allowed).toBe(false);
    expect(result.message).toContain('Reservation exceeds available stock');
  });

  test('Unauthorized user cannot perform a restricted operation', () => {
    const currentUser = { role: 'SALES_USER' };
    expect(authorizeRole(currentUser, ['ADMIN'])).toBe(false);
    expect(authorizeRole({ role: 'ADMIN' }, ['ADMIN'])).toBe(true);
  });
});
