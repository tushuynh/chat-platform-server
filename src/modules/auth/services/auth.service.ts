import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';
import { UserCredential } from '@shared/types';
import { UserService } from '@modules/user/services/user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async validateUser(userCredential: UserCredential) {
    const user = await this.userService.findUser(
      { username: userCredential.username },
      { selectAll: true }
    );
    if (!user) {
      throw new HttpException('Invalid Credential', HttpStatus.UNAUTHORIZED);
    }

    const isPasswordValid = await this.comparePassword(
      userCredential.password,
      user.password
    );
    return isPasswordValid ? user : null;
  }

  async hashPassword(rawPassword: string) {
    const salt = await genSalt();
    return hash(rawPassword, salt);
  }

  async comparePassword(rawPassword: string, hashedPassword: string) {
    return compare(rawPassword, hashedPassword);
  }
}
