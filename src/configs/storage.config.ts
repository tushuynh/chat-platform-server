import { registerAs } from '@nestjs/config';

export default registerAs(
  'storage',
  (): Record<string, any> => ({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_SECRET,
    endpoint: process.env.AWS_ENDPOINT,
    region: process.env.AWS_REGION,
  })
);
