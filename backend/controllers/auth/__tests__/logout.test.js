import { describe, it, expect, vi, beforeEach } from 'vitest';
import logout from '../logout.js';

function mockRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  return res;
}

describe('logout controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 200 and clears the jwtToken cookie', async () => {
    const res = mockRes();
    await logout({}, res);

    expect(res.clearCookie).toHaveBeenCalledWith('jwtToken', expect.objectContaining({
      httpOnly: true,
      sameSite: 'Strict',
    }));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    );
  });
});
