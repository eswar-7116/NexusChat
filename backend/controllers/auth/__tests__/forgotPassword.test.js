import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('express-validator', () => ({
  validationResult: vi.fn(),
}));
vi.mock('jsonwebtoken', () => ({
  default: { sign: vi.fn() },
}));
vi.mock('../../../models/User.js', () => ({
  default: { findOne: vi.fn() },
}));
vi.mock('../../../helpers/mailers.js', () => ({
  sendPasswordResetLink: vi.fn(),
}));

import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../../../models/User.js';
import { sendPasswordResetLink } from '../../../helpers/mailers.js';
import forgotPassword from '../forgotPassword.js';

// Helpers
function mockReq(overrides = {}) {
  return { body: { email: 'test@example.com' }, ...overrides };
}
function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// Tests
describe('forgotPassword controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 on validation errors', async () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: 'Invalid email' }],
    });
    const res = mockRes();
    await forgotPassword(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 if email is missing', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    const res = mockRes();
    await forgotPassword(mockReq({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 if user not found or not verified', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });
    const res = mockRes();
    await forgotPassword(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 500 if email sending fails', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    const fakeUser = { _id: 'u1', fullName: 'Test', email: 'test@example.com', isVerified: true };
    User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) });
    jwt.sign.mockReturnValue('reset-token');
    sendPasswordResetLink.mockResolvedValue({ success: false });

    const res = mockRes();
    await forgotPassword(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('returns 200 on successful password reset email', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    const fakeUser = { _id: 'u1', fullName: 'Test', email: 'test@example.com', isVerified: true };
    User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(fakeUser) });
    jwt.sign.mockReturnValue('reset-token');
    sendPasswordResetLink.mockResolvedValue({ success: true });

    const res = mockRes();
    await forgotPassword(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendPasswordResetLink).toHaveBeenCalledWith('Test', 'test@example.com', expect.stringContaining('reset-password'));
  });
});
