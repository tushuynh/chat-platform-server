import { APP_ENVIRONMENT } from '@common/constants/constant';
import { registerAs } from '@nestjs/config';

export default registerAs(
  'app',
  (): Record<string, any> => ({
    name: process.env.APP_NAME ?? 'nest',
    env: process.env.APP_ENVIRONMENT ?? APP_ENVIRONMENT.DEVELOPMENT,
    port: parseInt(process.env.PORT) || 3000,

    globalPrefix: '/api',
  })
);
