import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../helpers/socketio.js', () => ({
  getSocketId: vi.fn(),
  io: { to: vi.fn(() => ({ emit: vi.fn() })) },
}));
vi.mock('../../../models/Message.js', () => ({
  default: { updateMany: vi.fn() },
}));
vi.mock('../../../models/User.js', () => ({
  default: { findById: vi.fn() },
}));
vi.mock('mongoose', () => ({ default: {} }));

import { getSocketId, io } from '../../../helpers/socketio.js';
import Message from '../../../models/Message.js';
import User from '../../../models/User.js';
import readUnread from '../readUnread.js';

// Helpers
function mockReq(overrides = {}) {
  return {
    params: { id: 'sender1' },
    user: { _id: 'me', blockedUserIds: [] },
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
describe('readUnread controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('marks messages as read and returns block status', async () => {
    Message.updateMany.mockResolvedValue({ modifiedCount: 3 });
    getSocketId.mockResolvedValue('socket-abc');
    const emitFn = vi.fn();
    io.to.mockReturnValue({ emit: emitFn });
    User.findById.mockResolvedValue({ blockedUserIds: [] });

    const res = mockRes();
    await readUnread(mockReq(), res);

    expect(Message.updateMany).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.success).toBe(true);
    expect(body.blocked).toBe(false);
  });

  it('detects when current user has blocked the sender', async () => {
    Message.updateMany.mockResolvedValue({});
    getSocketId.mockResolvedValue(null);

    const res = mockRes();
    await readUnread(mockReq({
      user: { _id: 'me', blockedUserIds: ['sender1'] },
    }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.blocked).toBe(true);
    expect(body.blockedByUser).toBe(true);
  });

  it('detects when sender has blocked the current user', async () => {
    Message.updateMany.mockResolvedValue({});
    getSocketId.mockResolvedValue(null);
    User.findById.mockResolvedValue({ blockedUserIds: ['me'] });

    const res = mockRes();
    await readUnread(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(201);
    const body = res.json.mock.calls[0][0];
    expect(body.blocked).toBe(true);
    expect(body.blockedByUser).toBe(false);
  });

  it('returns 500 on internal error', async () => {
    Message.updateMany.mockRejectedValue(new Error('DB error'));
    const res = mockRes();
    await readUnread(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
