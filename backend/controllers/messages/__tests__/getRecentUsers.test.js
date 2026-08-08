import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../models/User.js', () => ({
  default: { find: vi.fn() },
}));
vi.mock('../../../models/Message.js', () => ({
  default: { findOne: vi.fn() },
}));

import User from '../../../models/User.js';
import Message from '../../../models/Message.js';
import getRecentUsers from '../getRecentUsers.js';

// Helpers
function mockReq(overrides = {}) {
  return {
    user: { _id: 'currentUser', recentUserIds: ['u2', 'u3'] },
    ...overrides,
  };
}
function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function chainableLean(result) {
  return { lean: vi.fn().mockResolvedValue(result) };
}

function chainableMessageQuery(result) {
  const chain = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.sort = vi.fn().mockReturnValue(chain);
  chain.lean = vi.fn().mockResolvedValue(result);
  return chain;
}

// Tests
describe('getRecentUsers controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns empty array when no recent users', async () => {
    const res = mockRes();
    await getRecentUsers(
      { user: { _id: 'currentUser', recentUserIds: [] } },
      res
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ recentUsers: [] })
    );
  });

  it('returns recent users sorted by last message timestamp', async () => {
    const recentUsers = [
      { _id: 'u2', username: 'alice', createdAt: new Date('2025-01-01') },
      { _id: 'u3', username: 'bob', createdAt: new Date('2025-01-02') },
    ];
    User.find.mockReturnValue(chainableLean(recentUsers));

    // u3 has a more recent message than u2
    Message.findOne
      .mockReturnValueOnce(chainableMessageQuery({ timestamp: new Date('2025-06-01') })) // u2
      .mockReturnValueOnce(chainableMessageQuery({ timestamp: new Date('2025-07-01') })); // u3

    const res = mockRes();
    await getRecentUsers(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.recentUsers).toHaveLength(2);
    // u3 (bob) should come first because lastMessageAt is more recent
    expect(body.recentUsers[0].username).toBe('bob');
  });

  it('returns 500 on internal error', async () => {
    User.find.mockImplementation(() => { throw new Error('DB error'); });
    const res = mockRes();
    await getRecentUsers(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
