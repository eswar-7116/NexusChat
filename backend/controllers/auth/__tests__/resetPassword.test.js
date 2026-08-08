import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('express-validator', () => ({
  validationResult: vi.fn(),
}));
vi.mock('bcryptjs', () => ({
  default: { hash: vi.fn() },
}));
vi.mock('jsonwebtoken', () => ({
  default: { verify: vi.fn() },
}));
vi.mock('../../../models/User.js', () => ({
  default: { findById: vi.fn() },
}));

import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../../models/User.js';
import resetPassword from '../resetPassword.js';

// Helpers
function mockReq(overrides = {}) {
  return {
    body: { userId: 'u1', token: 'valid-token', password: 'NewPass123' },
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
describe('resetPassword controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 on validation errors', async () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: 'Password too short' }],
    });
    const res = mockRes();
    await resetPassword(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 401 on invalid/expired token', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    jwt.verify.mockImplementation(() => { throw new Error('jwt expired'); });
    const res = mockRes();
    await resetPassword(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 if user not found', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    jwt.verify.mockReturnValue({ id: 'u1' });
    User.findById.mockResolvedValue(null);
    const res = mockRes();
    await resetPassword(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 on successful password reset', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    jwt.verify.mockReturnValue({ id: 'u1' });
    const fakeUser = { isVerified: true, password: 'old', save: vi.fn().mockResolvedValue() };
    User.findById.mockResolvedValue(fakeUser);
    bcrypt.hash.mockResolvedValue('new-hashed');

    const res = mockRes();
    await resetPassword(mockReq(), res);

    expect(fakeUser.password).toBe('new-hashed');
    expect(fakeUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
