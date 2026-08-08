import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('express-validator', () => ({
  validationResult: vi.fn(),
}));
vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn(), hash: vi.fn() },
}));
vi.mock('../../../models/User.js', () => ({
  default: { findById: vi.fn() },
}));

import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../../../models/User.js';
import changePassword from '../changePassword.js';

// Helpers
function mockReq(overrides = {}) {
  return {
    body: { oldPassword: 'OldPass1', newPassword: 'NewPass1' },
    user: { _id: 'u1' },
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
describe('changePassword controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 on validation errors', async () => {
    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => [{ msg: 'Password too short' }],
    });
    const res = mockRes();
    await changePassword(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 if user not found', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findById.mockResolvedValue(null);
    const res = mockRes();
    await changePassword(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 401 on incorrect old password', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    User.findById.mockResolvedValue({ password: 'hashed' });
    bcrypt.compare.mockResolvedValue(false);
    const res = mockRes();
    await changePassword(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 200 on successful password change', async () => {
    validationResult.mockReturnValue({ isEmpty: () => true });
    const fakeUser = { password: 'old-hash', save: vi.fn().mockResolvedValue() };
    User.findById.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue('new-hash');

    const res = mockRes();
    await changePassword(mockReq(), res);

    expect(fakeUser.password).toBe('new-hash');
    expect(fakeUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
