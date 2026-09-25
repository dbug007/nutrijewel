const fees = require('./fees');

const {
  feesFor, noFees, NO_FEES_MESSAGE, PLATFORM_FEE_BPS, PLATFORM_FEE_BPS_LARGE,
  CONVENIENCE_FEE_BPS, CONVENIENCE_FEE_INFO, PLATFORM_FEE_LABEL, CONVENIENCE_FEE_LABEL,
} = fees;

/* The owner's decision, 2026-09-25: no platform fee and no convenience fee.
   Every product price went up 3% instead (products.data.js). A failure here
   means a fee came back: that is a business decision for the owner, and it
   also makes the "zero fees" line at checkout false. */
describe("the owner's fees", () => {
  it('are zero, both of them', () => {
    expect(PLATFORM_FEE_BPS).toBe(0);
    expect(PLATFORM_FEE_BPS_LARGE).toBe(0);
    expect(CONVENIENCE_FEE_BPS).toBe(0);
    expect(noFees()).toBe(true);
  });

  it.each([0, 29900, 30800, 179800, 249900, 250000, 600000, 5000000])(
    'charge nothing on a base of %i paise',
    (base) => expect(feesFor(base)).toEqual({ platformFeePaise: 0, convenienceFeePaise: 0, feesPaise: 0 }),
  );

  it('refuse junk rather than inventing a fee', () => {
    [-500, NaN, null, undefined, '29900', 12.5].forEach((base) => {
      expect(feesFor(base)).toEqual({ platformFeePaise: 0, convenienceFeePaise: 0, feesPaise: 0 });
    });
  });
});

describe('what the customer reads', () => {
  /* The line is only allowed while it is true. */
  it('says zero platform and convenience fee, and only while both are zero', () => {
    expect(NO_FEES_MESSAGE).toMatch(/zero platform fee/i);
    expect(NO_FEES_MESSAGE).toMatch(/zero convenience fee/i);
    expect(noFees()).toBe(true);
  });

  it('never shows a percentage', () => {
    const text = [NO_FEES_MESSAGE, PLATFORM_FEE_LABEL, CONVENIENCE_FEE_LABEL, ...CONVENIENCE_FEE_INFO].join(' ');
    expect(text).not.toMatch(/%|percent|per cent/i);
  });

  it('never ties a fee to the payment method, if one ever returns', () => {
    expect(CONVENIENCE_FEE_INFO.join(' ')).not.toMatch(/card|upi|netbanking|razorpay|payment gateway|surcharge/i);
  });
});
