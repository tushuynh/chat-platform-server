import { registerAs } from '@nestjs/config';

export default registerAs(
  'auth',
  (): Record<string, any> => ({
    cookieSecret: process.env.COOKIE_SECRET,
    cors: {
      allowOrigin: process.env.ALLOW_ORIGIN ?? '*',
    },
    throttle: {
      ttl: 60 * 1000, // 1 min
      limit: 300, // max request per ttl
    },
  })
);
