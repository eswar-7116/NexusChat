import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../models/User.js', () => ({
  default: { findByIdAndUpdate: vi.fn() },
}));
vi.mock('../../../helpers/cloudinaryConfig.js', () => ({
  default: { uploader: { upload: vi.fn() } },
}));

import User from '../../../models/User.js';
import cloudinary from '../../../helpers/cloudinaryConfig.js';
import editProfile from '../editProfile.js';

// Helpers
function mockReq(overrides = {}) {
  return {
    body: { profilePic: 'data:image/png;base64,abc123' },
    user: { _id: 'u1' },
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
describe('editProfile controller', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns 401 if no userId on request', async () => {
    const res = mockRes();
    await editProfile({ body: { profilePic: 'data' }, user: {} }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('returns 400 if no profilePic provided', async () => {
    const res = mockRes();
    await editProfile(mockReq({ body: {} }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 if Cloudinary upload fails (no secure_url)', async () => {
    cloudinary.uploader.upload.mockResolvedValue({});
    const res = mockRes();
    await editProfile(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 404 if user not found after update', async () => {
    cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'https://cdn.example.com/img.jpg' });
    User.findByIdAndUpdate.mockResolvedValue(null);
    const res = mockRes();
    await editProfile(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it('returns 200 on successful profile update', async () => {
    const updatedUser = { _id: 'u1', profilePic: 'https://cdn.example.com/img.jpg' };
    cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'https://cdn.example.com/img.jpg' });
    User.findByIdAndUpdate.mockResolvedValue(updatedUser);

    const res = mockRes();
    await editProfile(mockReq(), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, user: updatedUser })
    );
  });

  it('returns 500 on internal error', async () => {
    cloudinary.uploader.upload.mockRejectedValue(new Error('Cloudinary down'));
    const res = mockRes();
    await editProfile(mockReq(), res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
