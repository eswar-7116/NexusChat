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
import unblock from '../unblock.js';

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
describe('unblock controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 when trying to unblock yourself', async () => {
    const res = mockRes();
    await unblock(mockReq({ params: { id: 'my-user-id' }, user: { _id: 'my-user-id' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 if user not found', async () => {
    User.findById.mockResolvedValue(null);
    const res = mockRes();
    await unblock(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 400 if user not blocked', async () => {
    User.findById.mockResolvedValue({ blockedUserIds: [] });
    const res = mockRes();
    await unblock(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'User not blocked' })
    );
  });

  it('returns 200 on successful unblock and emits socket event', async () => {
    const fakeUser = {
      blockedUserIds: {
        includes: vi.fn().mockReturnValue(true),
        pull: vi.fn(),
      },
      save: vi.fn().mockResolvedValue(),
    };
    User.findById.mockResolvedValue(fakeUser);
    getSocketId.mockResolvedValue('socket-456');
    const emitFn = vi.fn();
    io.to.mockReturnValue({ emit: emitFn });

    const res = mockRes();
    await unblock(mockReq(), res);

    expect(fakeUser.blockedUserIds.pull).toHaveBeenCalledWith('other-user-id');
    expect(fakeUser.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(emitFn).toHaveBeenCalledWith('unblocked', 'my-user-id');
  });
});
