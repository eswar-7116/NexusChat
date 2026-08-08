import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('express-validator', () => ({
  validationResult: vi.fn(),
}));
vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn() },
}));
vi.mock('jsonwebtoken', () => ({
  default: { sign: vi.fn() },
}));
vi.mock('../../../models/User.js', () => ({
  default: { findOne: vi.fn() },
}));

import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../../models/User.js';
import login from '../login.js';

// Helpers
function mockReq(overrides = {}) {
  return {
    cookies: {},
    body: { unameOrEmail: 'testuser', password: 'Password1' },
    ...overrides,
  };
}

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  return res;
}

// Tests
describe('login controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 on validation errors', async () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: 'bad' }],
    });
    const res = mockRes();
    await login(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
  });

  it('returns 401 if already logged in', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    const res = mockRes();
    await login(mockReq({ cookies: { jwtToken: 'existing' } }), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 404 if username not found', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockResolvedValue(null);
    const res = mockRes();
    await login(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 404 if user found but not verified', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockResolvedValue({ isVerified: false });
    const res = mockRes();
    await login(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 404 if email not found', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockResolvedValue(null);
    const res = mockRes();
    await login(mockReq({ body: { unameOrEmail: 'a@b.com', password: 'Password1' } }), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 401 on incorrect password', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockResolvedValue({ isVerified: true, password: 'hashed' });
    bcrypt.compare.mockResolvedValue(false);
    const res = mockRes();
    await login(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 and sets cookie on successful login', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    const fakeUser = { _id: 'u1', username: 'testuser', isVerified: true, password: 'hashed' };
    User.findOne.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue('jwt-token-123');

    const res = mockRes();
    await login(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalledWith('jwtToken', 'jwt-token-123', expect.any(Object));
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, user: fakeUser }));
  });

  it('returns 500 on internal error', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockRejectedValue(new Error('DB Error'));
    const res = mockRes();
    await login(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
