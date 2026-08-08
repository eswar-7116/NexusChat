import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../models/Message.js', () => ({
  default: { create: vi.fn() },
}));
vi.mock('../../../models/User.js', () => ({
  default: { findById: vi.fn(), updateOne: vi.fn() },
}));
vi.mock('../../../helpers/socketio.js', () => ({
  io: { to: vi.fn(() => ({ emit: vi.fn() })) },
  getSocketId: vi.fn(),
}));

import Message from '../../../models/Message.js';
import User from '../../../models/User.js';
import { io, getSocketId } from '../../../helpers/socketio.js';
import sendMessage from '../sendMessage.js';

// Helpers
function mockReq(overrides = {}) {
  return {
    user: { _id: 'sender1' },
    params: { id: 'receiver1' },
    body: { message: 'Hello!' },
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
describe('sendMessage controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 if message body is missing', async () => {
    const res = mockRes();
    await sendMessage(mockReq({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 if receiver not found', async () => {
    User.findById
      .mockResolvedValueOnce({ recentUserIds: [], blockedUserIds: [] }) // sender
      .mockResolvedValueOnce(null); // receiver
    const res = mockRes();
    await sendMessage(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 403 if sender blocked the receiver', async () => {
    User.findById
      .mockResolvedValueOnce({ recentUserIds: [], blockedUserIds: ['receiver1'] })
      .mockResolvedValueOnce({ recentUserIds: [], blockedUserIds: [] });
    const res = mockRes();
    await sendMessage(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'You have blocked this user' })
    );
  });

  it('returns 403 if receiver blocked the sender', async () => {
    User.findById
      .mockResolvedValueOnce({ recentUserIds: [], blockedUserIds: [] })
      .mockResolvedValueOnce({ recentUserIds: [], blockedUserIds: ['sender1'] });
    const res = mockRes();
    await sendMessage(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'You are blocked by the receiver' })
    );
  });

  it('returns 201 on success, emits socket event, updates recentUserIds', async () => {
    const senderData = { recentUserIds: [], blockedUserIds: [] };
    const receiverData = { recentUserIds: [], blockedUserIds: [] };
    // Mock includes to return false (arrays don't contain the IDs)
    senderData.recentUserIds.includes = vi.fn().mockReturnValue(false);
    receiverData.recentUserIds.includes = vi.fn().mockReturnValue(false);

    User.findById
      .mockResolvedValueOnce(senderData)
      .mockResolvedValueOnce(receiverData);
    User.updateOne.mockResolvedValue({});

    const newMsg = { _id: 'msg1', senderId: 'sender1', receiverId: 'receiver1', content: 'Hello!' };
    Message.create.mockResolvedValue(newMsg);
    getSocketId.mockResolvedValue('socket-789');
    const emitFn = vi.fn();
    io.to.mockReturnValue({ emit: emitFn });

    const res = mockRes();
    await sendMessage(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, chat: newMsg })
    );
    expect(io.to).toHaveBeenCalledWith('socket-789');
    expect(emitFn).toHaveBeenCalledWith('newMessage', newMsg);
  });

  it('returns 500 on internal error', async () => {
    User.findById.mockRejectedValue(new Error('DB error'));
    const res = mockRes();
    await sendMessage(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
