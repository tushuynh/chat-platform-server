import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UserModule } from '@modules/user/user.module';
import { AuthService } from './services/auth.service';

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
