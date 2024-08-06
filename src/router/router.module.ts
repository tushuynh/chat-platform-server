import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from '@modules/user/user.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [AuthModule, UserModule],
  providers: [],
})
export class RouterModule {}
