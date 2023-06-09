import { BasketRebateMapper } from './basket-rebate.mapper';

describe('Basket Rebate Mapper', () => {
  describe('fromData', () => {
    it(`should return BasketRebate when getting BasketRebateData`, () => {
      const basketRebate = BasketRebateMapper.fromData({
        id: 'basketDiscountId',
        promotionType: 'Discount',
        amount: {
          gross: {
            value: 43.34,
            currency: 'USD',
          },
          net: {
            value: 40.34,
            currency: 'USD',
          },
        },
        description: 'Discount description',
        code: 'CODE5433',
        promotion: 'FreeShippingOnLEDTVs',
      });

      expect(basketRebate).toMatchInlineSnapshot(`
        {
          "amount": {
            "currency": "USD",
            "gross": 43.34,
            "net": 40.34,
            "type": "PriceItem",
          },
          "code": "CODE5433",
          "description": "Discount description",
          "id": "basketDiscountId",
          "promotionId": "FreeShippingOnLEDTVs",
          "rebateType": "Discount",
        }
      `);
    });
  });
});
