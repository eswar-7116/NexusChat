import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('express-validator', () => ({
  validationResult: vi.fn(),
}));
vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn() },
}));
vi.mock('../../../models/User.js', () => {
  const saveFn = vi.fn();
  function MockUser(data) {
    Object.assign(this, data);
    this.save = saveFn;
  }
  MockUser.findOne = vi.fn();
  MockUser._saveFn = saveFn;
  return { default: MockUser };
});
vi.mock('../../../helpers/mailers.js', () => ({
  sendVerificationOtp: vi.fn(),
}));
vi.mock('../../../helpers/otpGenerator.js', () => ({
  default: vi.fn(() => '123456'),
}));
vi.mock('../../../helpers/redis.js', () => ({
  default: { set: vi.fn() },
  OTP_EXPIRY_SECONDS: 600,
}));

import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../../../models/User.js';
import { sendVerificationOtp } from '../../../helpers/mailers.js';
import redis from '../../../helpers/redis.js';
import signup from '../signUp.js';

// Helpers
function mockReq(overrides = {}) {
  return {
    body: {
      fullName: 'Test User',
      username: 'testuser',
      email: 'test@example.com',
      password: 'Password1',
    },
    ...overrides,
  };
}

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// Tests
describe('signup controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 on validation errors', async () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: 'Username is required' }],
    });
    const res = mockRes();
    await signup(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Username is required' })
    );
  });

  it('returns 400 if verified username already taken', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne
      .mockResolvedValueOnce({ isVerified: true }) // existingUsername
      .mockResolvedValueOnce(null);                 // existingEmail
    const res = mockRes();
    await signup(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Username is already taken.' })
    );
  });

  it('returns 400 if verified email already registered', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne
      .mockResolvedValueOnce(null)                  // existingUsername
      .mockResolvedValueOnce({ isVerified: true });  // existingEmail
    const res = mockRes();
    await signup(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Email is already registered.' })
    );
  });

  it('returns 400 if OTP email fails to send', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed');
    sendVerificationOtp.mockResolvedValue({ success: false });
    const res = mockRes();
    await signup(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 201 for new user registration', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockResolvedValue(null);
    bcrypt.hash.mockResolvedValue('hashed');
    sendVerificationOtp.mockResolvedValue({ success: true });
    User._saveFn.mockResolvedValue();
    redis.set.mockResolvedValue('OK');

    const res = mockRes();
    await signup(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(redis.set).toHaveBeenCalledWith('otp:testuser', '123456', { ex: 600 });
  });

  it('updates existing unverified user by username', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    const existingUser = { isVerified: false, save: vi.fn().mockResolvedValue() };
    User.findOne
      .mockResolvedValueOnce(existingUser) // existingUsername (unverified)
      .mockResolvedValueOnce(null);
    bcrypt.hash.mockResolvedValue('hashed');
    sendVerificationOtp.mockResolvedValue({ success: true });
    redis.set.mockResolvedValue('OK');

    const res = mockRes();
    await signup(mockReq(), res);

    expect(existingUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 500 on internal error', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockRejectedValue(new Error('DB down'));
    const res = mockRes();
    await signup(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
