import { Redis } from '@upstash/redis';
import { config } from 'dotenv';

config();

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;

export const OTP_EXPIRY_SECONDS = 10 * 60;  // 10 minutes
