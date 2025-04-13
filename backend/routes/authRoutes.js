import { Router } from 'express';
import { body, check } from 'express-validator';
import { configDotenv } from 'dotenv';
import signup from '../controllers/auth/signUp.js';
import login from '../controllers/auth/login.js';
import verifyUserOtp from '../controllers/auth/verifyUserOtp.js';
import forgotPassword from '../controllers/auth/forgotPassword.js';
import resetPassword from '../controllers/auth/resetPassword.js';
import checkAuth from '../middleware/authMiddleware.js';
import logout from '../controllers/auth/logout.js';
import changePassword from '../controllers/auth/changePassword.js';
import editProfile from '../controllers/auth/editProfile.js';
import block from '../controllers/auth/block.js';

configDotenv();
const router = Router();

router.post('/signup', [
    // Username validation
    body('username')
        .not().isEmpty().withMessage('Username is required')
        .matches(/^[a-zA-Z][a-zA-Z0-9._-]{3,32}$/).withMessage('Username must start with a letter and contain only letters, numbers, dots, underscores, or hyphens, and be between 4 and 33 characters long'),

    // Email validation
    body('email').isEmail().withMessage('Invalid email format'),

    // Password validation
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one alphabet')
        .matches(/\d/).withMessage('Password must contain at least one number')
], signup);

router.post('/login',[
    // Username validation
    body('username')
        .not().isEmpty().withMessage('Username is required')
        .matches(/^[a-zA-Z][a-zA-Z0-9._-]{3,32}$/).withMessage('Username must start with a letter and contain only letters, numbers, dots, underscores, or hyphens, and be between 4 and 33 characters long'),
    
    // Password validation
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one alphabet')
        .matches(/\d/).withMessage('Password must contain at least one number')
], login);

router.post('/verify-user-otp', [
    // Username validation
    body('username')
        .not().isEmpty().withMessage('Username is required')
        .matches(/^[a-zA-Z][a-zA-Z0-9._-]{3,32}$/).withMessage('Username must start with a letter and contain only letters, numbers, dots, underscores, or hyphens, and be between 4 and 33 characters long'),
    // OTP validation
    body('otp')
        .isNumeric().withMessage('OTP must contain digits only')
        .matches(/^\d{6}$/).withMessage('OTP length must be 6')
], verifyUserOtp);

router.post('/forgot-password',
    // Email validation
    body('email').isEmail().withMessage('Invalid email format'),
    forgotPassword
);

router.post('/reset-password',
    // Password validation
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one alphabet')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    resetPassword
);

router.post('/logout', checkAuth, logout);

router.post('/change-password', [
    checkAuth,
    // Old password validation
    body('oldPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one alphabet')
        .matches(/\d/).withMessage('Password must contain at least one number'),
    // New password validation
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-zA-Z]/).withMessage('Password must contain at least one alphabet')
        .matches(/\d/).withMessage('Password must contain at least one number')
], changePassword);

router.post('/edit-profile', checkAuth, editProfile);

router.get('/block/:id', checkAuth, block);

export default router;
