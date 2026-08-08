import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../helpers/socketio.js', () => ({
  getSocketId: vi.fn(),
  io: { to: vi.fn(() => ({ emit: vi.fn() })) },
}));
vi.mock('../../../models/User.js', () => ({
  default: { findById: vi.fn() },
}));

import { getSocketId, io } from '../../../helpers/socketio.js';
import User from '../../../models/User.js';
import block from '../block.js';

// Helpers
function mockReq(overrides = {}) {
  return {
    params: { id: 'other-user-id' },
    user: { _id: 'my-user-id' },
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
describe('block controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when trying to block yourself', async () => {
    const res = mockRes();
    await block(mockReq({ params: { id: 'my-user-id' }, user: { _id: 'my-user-id' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'You cannot block yourself' })
    );
  });

  it('returns 404 if user not found', async () => {
    User.findById.mockResolvedValue(null);
    const res = mockRes();
    await block(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 if user already blocked', async () => {
    User.findById.mockResolvedValue({
      blockedUserIds: ['other-user-id'],
    });
    const res = mockRes();
    await block(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 200 on successful block and emits socket event', async () => {
    const fakeUser = {
      blockedUserIds: [],
      save: vi.fn().mockResolvedValue(),
    };
    // Need to add `push` since blockedUserIds is a plain array in mock
    fakeUser.blockedUserIds.push = vi.fn();
    User.findById.mockResolvedValue(fakeUser);
    getSocketId.mockResolvedValue('socket-123');
    const emitFn = vi.fn();
    io.to.mockReturnValue({ emit: emitFn });

    const res = mockRes();
    await block(mockReq(), res);

    expect(fakeUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(io.to).toHaveBeenCalledWith('socket-123');
    expect(emitFn).toHaveBeenCalledWith('blocked', 'my-user-id');
  });

  it('returns 200 even if blocked user is offline (no socket)', async () => {
    const fakeUser = {
      blockedUserIds: [],
      save: vi.fn().mockResolvedValue(),
    };
    fakeUser.blockedUserIds.push = vi.fn();
    User.findById.mockResolvedValue(fakeUser);
    getSocketId.mockResolvedValue(null);

    const res = mockRes();
    await block(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
