import { describe, it, expect } from 'vitest';
import generateOTP from '../otpGenerator.js';

describe('generateOTP helper', () => {
  it('generates a 6-digit numeric string', () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
    expect(typeof otp).toBe('string');
  });

  it('generates a number between 100000 and 999999', () => {
    for (let i = 0; i < 50; i++) {
      const num = parseInt(generateOTP(), 10);
      expect(num).toBeGreaterThanOrEqual(100000);
      expect(num).toBeLessThanOrEqual(999999);
    }
  });

  it('generates different OTPs on consecutive calls (not static)', () => {
    const otps = new Set();
    for (let i = 0; i < 20; i++) {
      otps.add(generateOTP());
    }
    // With 20 calls, extremely unlikely to get all the same value
    expect(otps.size).toBeGreaterThan(1);
  });
});
