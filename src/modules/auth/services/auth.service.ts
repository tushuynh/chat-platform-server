import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class AuthService {
  constructor() {}

  async hashPassword(rawPassword: string) {
    const salt = await genSalt();
    return hash(rawPassword, salt);
  }

  async comparePassword(rawPassword: string, hashedPassword: string) {
    return compare(rawPassword, hashedPassword);
  }
}
