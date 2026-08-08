import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../models/User.js', () => {
  const findMock = vi.fn();
  return {
    default: { find: findMock },
  };
});

import User from '../../../models/User.js';
import getUsers from '../getUsers.js';

// Helpers
function mockReq(overrides = {}) {
  return { user: { _id: 'currentUser' }, ...overrides };
}
function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function chainableSelect(result) {
  const chain = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.lean = vi.fn().mockResolvedValue(result);
  return chain;
}

// Tests
describe('getUsers controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns verified users excluding current user', async () => {
    const users = [
      { _id: 'u2', username: 'alice' },
      { _id: 'u3', username: 'bob' },
    ];
    User.find.mockReturnValue(chainableSelect(users));

    const res = mockRes();
    await getUsers(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, users })
    );
  });

  it('returns 500 on internal error', async () => {
    User.find.mockImplementation(() => { throw new Error('DB error'); });
    const res = mockRes();
    await getUsers(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
