import { registerAs } from '@nestjs/config';

export default registerAs(
  'auth',
  (): Record<string, any> => ({
    cookieSecret: process.env.COOKIE_SECRET,
    cors: {
      allowOrigin: process.env.ALLOW_ORIGIN ?? '*',
    },
  })
);
