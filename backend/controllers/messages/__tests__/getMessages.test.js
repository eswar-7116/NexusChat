import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('mongoose', () => ({
  default: { isValidObjectId: vi.fn() },
}));
vi.mock('../../../models/Message.js', () => ({
  default: { find: vi.fn() },
}));

import mongoose from 'mongoose';
import Message from '../../../models/Message.js';
import getMessages from '../getMessages.js';

// Helpers
function mockReq(overrides = {}) {
  return {
    user: { _id: 'user1' },
    params: { id: 'user2' },
    query: {},
    ...overrides,
  };
}
function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

// Creates a chainable Mongoose query mock
function chainableQuery(result) {
  const chain = {};
  chain.sort = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue(chain);
  chain.lean = vi.fn().mockResolvedValue(result);
  return chain;
}

// Tests
describe('getMessages controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 400 for invalid receiver ID', async () => {
    mongoose.isValidObjectId.mockReturnValue(false);
    const res = mockRes();
    await getMessages(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Invalid receiver ID' })
    );
  });

  it('returns 400 for invalid "before" cursor', async () => {
    mongoose.isValidObjectId.mockReturnValue(true);
    const res = mockRes();
    await getMessages(mockReq({ query: { before: 'not-a-date' } }), res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Invalid 'before' cursor" })
    );
  });

  it('returns messages with hasMore=false when fewer than limit', async () => {
    mongoose.isValidObjectId.mockReturnValue(true);
    const msgs = [
      { _id: 'm1', content: 'hi', timestamp: new Date('2025-01-01') },
      { _id: 'm2', content: 'hello', timestamp: new Date('2025-01-02') },
    ];
    Message.find.mockReturnValue(chainableQuery(msgs));

    const res = mockRes();
    await getMessages(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.success).toBe(true);
    expect(responseBody.hasMore).toBe(false);
    expect(responseBody.nextCursor).toBeNull();
  });

  it('returns hasMore=true and nextCursor when more messages exist', async () => {
    mongoose.isValidObjectId.mockReturnValue(true);
    // Return limit+1 (31) messages to trigger hasMore
    const msgs = Array.from({ length: 31 }, (_, i) => ({
      _id: `m${i}`,
      content: `msg ${i}`,
      timestamp: new Date(2025, 0, 31 - i), // newest first
    }));
    Message.find.mockReturnValue(chainableQuery(msgs));

    const res = mockRes();
    await getMessages(mockReq(), res);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.hasMore).toBe(true);
    expect(responseBody.nextCursor).toBeDefined();
    expect(responseBody.messages).toHaveLength(30);
  });

  it('applies limit from query and caps at MAX_LIMIT', async () => {
    mongoose.isValidObjectId.mockReturnValue(true);
    Message.find.mockReturnValue(chainableQuery([]));

    const res = mockRes();
    await getMessages(mockReq({ query: { limit: '200' } }), res);

    // limit is capped to MAX_LIMIT (100), so limit(101) is called
    const limitCall = Message.find.mock.results[0].value.limit;
    expect(limitCall).toHaveBeenCalledWith(101);
  });

  it('applies "before" cursor as timestamp filter', async () => {
    mongoose.isValidObjectId.mockReturnValue(true);
    Message.find.mockReturnValue(chainableQuery([]));

    const beforeDate = '2025-06-01T00:00:00Z';
    const res = mockRes();
    await getMessages(mockReq({ query: { before: beforeDate } }), res);

    const filterArg = Message.find.mock.calls[0][0];
    expect(filterArg.timestamp).toBeDefined();
    expect(filterArg.timestamp.$lt).toEqual(new Date(beforeDate));
  });

  it('returns 500 on internal error', async () => {
    mongoose.isValidObjectId.mockReturnValue(true);
    Message.find.mockImplementation(() => { throw new Error('DB error'); });
    const res = mockRes();
    await getMessages(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
