import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('express-validator', () => ({
  validationResult: vi.fn(),
}));
vi.mock('../../../models/User.js', () => ({
  default: { findOne: vi.fn() },
}));
vi.mock('../../../helpers/socketio.js', () => ({
  io: { emit: vi.fn() },
}));
vi.mock('../../../helpers/redis.js', () => ({
  default: { get: vi.fn(), del: vi.fn() },
}));

import { validationResult } from 'express-validator';
import User from '../../../models/User.js';
import { io } from '../../../helpers/socketio.js';
import redis from '../../../helpers/redis.js';
import verifyUserOtp from '../verifyUserOtp.js';

// Helpers
function mockReq(overrides = {}) {
  return { body: { username: 'testuser', otp: '123456' }, ...overrides };
}
function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// Tests
describe('verifyUserOtp controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 on validation errors', async () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: 'bad' }],
    });
    const res = mockRes();
    await verifyUserOtp(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 if user does not exist', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });
    const res = mockRes();
    await verifyUserOtp(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 401 if user already verified', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ isVerified: true }),
    });
    const res = mockRes();
    await verifyUserOtp(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 401 if OTP expired (not in Redis)', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ isVerified: false }),
    });
    redis.get.mockResolvedValue(null);
    const res = mockRes();
    await verifyUserOtp(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('expired') })
    );
  });

  it('returns 401 on incorrect OTP', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ isVerified: false }),
    });
    redis.get.mockResolvedValue('654321');
    const res = mockRes();
    await verifyUserOtp(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Incorrect OTP!' })
    );
  });

  it('returns 200 on correct OTP, sets isVerified, emits event', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    const fakeUser = { isVerified: false, save: vi.fn().mockResolvedValue() };
    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(fakeUser),
    });
    redis.get.mockResolvedValue('123456');
    redis.del.mockResolvedValue(1);

    const res = mockRes();
    await verifyUserOtp(mockReq(), res);

    expect(fakeUser.isVerified).toBe(true);
    expect(fakeUser.save).toHaveBeenCalled();
    expect(redis.del).toHaveBeenCalledWith('otp:testuser');
    expect(io.emit).toHaveBeenCalledWith('userAdded', fakeUser);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
