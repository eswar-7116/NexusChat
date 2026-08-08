import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../models/User.js', () => ({
  default: { findOne: vi.fn() },
}));
vi.mock('../../../helpers/mailers.js', () => ({
  sendVerificationOtp: vi.fn(),
}));
vi.mock('../../../helpers/otpGenerator.js', () => ({
  default: vi.fn(() => '654321'),
}));
vi.mock('../../../helpers/redis.js', () => ({
  default: { set: vi.fn() },
  OTP_EXPIRY_SECONDS: 600,
}));

import User from '../../../models/User.js';
import { sendVerificationOtp } from '../../../helpers/mailers.js';
import redis from '../../../helpers/redis.js';
import resendOTP from '../resendOtp.js';

// Helpers
function mockReq(overrides = {}) {
  return { params: { username: 'testuser' }, ...overrides };
}
function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// Tests
describe('resendOTP controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 if user not found', async () => {
    User.findOne.mockResolvedValue(null);
    const res = mockRes();
    await resendOTP(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 if user already verified', async () => {
    User.findOne.mockResolvedValue({ isVerified: true });
    const res = mockRes();
    await resendOTP(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 500 if email sending fails', async () => {
    User.findOne.mockResolvedValue({
      isVerified: false,
      username: 'testuser',
      fullname: 'Test',
      email: 'test@example.com',
    });
    redis.set.mockResolvedValue('OK');
    sendVerificationOtp.mockResolvedValue({ success: false });

    const res = mockRes();
    await resendOTP(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('returns 200 on success and stores new OTP in Redis', async () => {
    User.findOne.mockResolvedValue({
      isVerified: false,
      username: 'testuser',
      fullname: 'Test',
      email: 'test@example.com',
    });
    redis.set.mockResolvedValue('OK');
    sendVerificationOtp.mockResolvedValue({ success: true });

    const res = mockRes();
    await resendOTP(mockReq(), res);

    expect(redis.set).toHaveBeenCalledWith('otp:testuser', '654321', { ex: 600 });
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
