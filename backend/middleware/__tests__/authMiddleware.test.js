import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('jsonwebtoken', () => ({
  default: { verify: vi.fn() },
}));
vi.mock('../../models/User.js', () => ({
  default: { findById: vi.fn() },
}));

import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import checkAuth from '../authMiddleware.js';

// Helpers
function mockReq(overrides = {}) {
  return { cookies: {}, ...overrides };
}
function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// Tests
describe('checkAuth middleware', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 if no token provided', async () => {
    const res = mockRes();
    const next = vi.fn();
    await checkAuth(mockReq(), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 if token verification fails', async () => {
    jwt.verify.mockImplementation(() => { throw new Error('invalid token'); });
    const res = mockRes();
    const next = vi.fn();
    await checkAuth(mockReq({ cookies: { jwtToken: 'bad-token' } }), res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 if user not found in DB', async () => {
    jwt.verify.mockReturnValue({ id: 'u1' });
    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });
    const res = mockRes();
    const next = vi.fn();
    await checkAuth(mockReq({ cookies: { jwtToken: 'valid' } }), res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('attaches req.user and calls next() on success', async () => {
    const fakeUser = { _id: 'u1', username: 'alice' };
    jwt.verify.mockReturnValue({ id: 'u1' });
    User.findById.mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) });

    const req = mockReq({ cookies: { jwtToken: 'valid-token' } });
    const res = mockRes();
    const next = vi.fn();
    await checkAuth(req, res, next);

    expect(req.user).toEqual(fakeUser);
    expect(next).toHaveBeenCalled();
  });
});
