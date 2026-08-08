import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../helpers/socketio.js', () => ({
  getSocketId: vi.fn(),
  io: { to: vi.fn(() => ({ emit: vi.fn() })) },
}));
vi.mock('../../../models/Message.js', () => ({
  default: { findById: vi.fn() },
}));

import { getSocketId, io } from '../../../helpers/socketio.js';
import Message from '../../../models/Message.js';
import deleteForEveryone from '../deleteForEveryone.js';

// Helpers
function mockReq(overrides = {}) {
  return {
    params: { msgid: 'msg1' },
    user: { _id: 'sender1', username: 'alice' },
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
describe('deleteForEveryone controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 if message not found', async () => {
    Message.findById.mockResolvedValue(null);
    const res = mockRes();
    await deleteForEveryone(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 201 on successful delete for everyone', async () => {
    const fakeMsg = {
      senderId: 'sender1',
      receiverId: 'receiver1',
      deleteForEveryone: vi.fn().mockResolvedValue(),
    };
    Message.findById.mockResolvedValue(fakeMsg);
    getSocketId.mockResolvedValue('socket-abc');
    const emitFn = vi.fn();
    io.to.mockReturnValue({ emit: emitFn });

    const res = mockRes();
    await deleteForEveryone(mockReq(), res);

    expect(fakeMsg.deleteForEveryone).toHaveBeenCalledWith('sender1');
    expect(res.status).toHaveBeenCalledWith(201);
  });

  it('returns 500 on internal error', async () => {
    Message.findById.mockRejectedValue(new Error('DB error'));
    const res = mockRes();
    await deleteForEveryone(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
