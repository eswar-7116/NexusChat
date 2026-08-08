import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../models/Message.js', () => ({
  default: { findOneAndUpdate: vi.fn() },
}));

import Message from '../../../models/Message.js';
import editMessage from '../editMessage.js';

// Helpers
function mockReq(overrides = {}) {
  return {
    params: { id: 'msg1' },
    body: { newContent: 'Updated message' },
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
describe('editMessage controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 404 if message not found', async () => {
    Message.findOneAndUpdate.mockResolvedValue(null);
    const res = mockRes();
    await editMessage(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 on successful edit', async () => {
    Message.findOneAndUpdate.mockResolvedValue({
      _id: 'msg1',
      content: 'Updated message',
      edited: true,
    });
    const res = mockRes();
    await editMessage(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });

  it('returns 500 on internal error', async () => {
    Message.findOneAndUpdate.mockRejectedValue(new Error('DB error'));
    const res = mockRes();
    await editMessage(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
