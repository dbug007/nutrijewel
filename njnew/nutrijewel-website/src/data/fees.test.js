const fees = require('./fees');

const {
  feesFor, PLATFORM_FEE_BPS, PLATFORM_FEE_BPS_LARGE, PLATFORM_FEE_THRESHOLD_PAISE,
  CONVENIENCE_FEE_BPS, CONVENIENCE_FEE_INFO, PLATFORM_FEE_LABEL, CONVENIENCE_FEE_LABEL,
} = fees;

/* The owner's rates, 2026-09-25 (lowered the same day). A failure here means
   the fees changed: that is a business decision for the owner, not a test to
   update. */
describe("the owner's fees", () => {
  it('are 2% platform below Rs 2,500, 0.5% from Rs 2,500 up, and 0.5% convenience', () => {
    expect(PLATFORM_FEE_BPS).toBe(200);
    expect(PLATFORM_FEE_BPS_LARGE).toBe(50);
    expect(PLATFORM_FEE_THRESHOLD_PAISE).toBe(250000);
    expect(CONVENIENCE_FEE_BPS).toBe(50);
  });

  it.each([
    // base paise, platform, convenience
    [29900, 600, 100],       // Rs 299: 2% 5.98 -> 6, 0.5% 1.495 -> 1
    [36500, 700, 200],       // Rs 365: 7.30 -> 7, 1.825 -> 2
    [179800, 3600, 900],     // Rs 1,798: 35.96 -> 36, 8.99 -> 9
    [249900, 5000, 1200],    // Rs 2,499: still 2%, 49.98 -> 50, 12.495 -> 12
    [250000, 1300, 1300],    // Rs 2,500: 0.5% now, 12.50 -> 13 (half up)
    [600000, 3000, 3000],    // Rs 6,000: 30, 30
    [10000, 200, 100],       // Rs 100: 2, 0.50 -> 1
  ])('on a base of %i paise: platform %i, convenience %i', (base, platform, convenience) => {
    const f = feesFor(base);
    expect(f.platformFeePaise).toBe(platform);
    expect(f.convenienceFeePaise).toBe(convenience);
    expect(f.feesPaise).toBe(platform + convenience);
  });

  it('switch to the lower platform rate exactly at Rs 2,500', () => {
    expect(feesFor(PLATFORM_FEE_THRESHOLD_PAISE - 1).platformFeePaise).toBe(5000);
    expect(feesFor(PLATFORM_FEE_THRESHOLD_PAISE).platformFeePaise).toBe(1300);
  });

  it('are always whole rupees, so the page never shows paise', () => {
    for (let base = 100; base < 500000; base += 997) {
      const f = feesFor(base);
      expect(f.platformFeePaise % 100).toBe(0);
      expect(f.convenienceFeePaise % 100).toBe(0);
    }
  });

  it('are zero on nothing, and refuse junk rather than inventing a fee', () => {
    [0, -500, NaN, null, undefined, '29900', 12.5].forEach((base) => {
      expect(feesFor(base)).toEqual({ platformFeePaise: 0, convenienceFeePaise: 0, feesPaise: 0 });
    });
  });
});

describe('what the customer reads', () => {
  it('never shows a percentage', () => {
    const text = [PLATFORM_FEE_LABEL, CONVENIENCE_FEE_LABEL, ...CONVENIENCE_FEE_INFO].join(' ');
    expect(text).not.toMatch(/%|percent|per cent/i);
  });

  it('explains the convenience fee in exactly three points', () => {
    expect(CONVENIENCE_FEE_INFO).toHaveLength(3);
    CONVENIENCE_FEE_INFO.forEach((line) => expect(line.length).toBeGreaterThan(20));
  });

  /* Card networks and Razorpay restrict surcharges for paying online. The fee
     applies the same whichever way the customer pays, and its reasons must not
     say otherwise. */
  it('never ties the convenience fee to the payment method', () => {
    expect(CONVENIENCE_FEE_INFO.join(' ')).not.toMatch(/card|upi|netbanking|razorpay|payment gateway|surcharge/i);
  });
});
