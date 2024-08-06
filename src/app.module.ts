import { CommonModule } from '@common/common.module';
import { Module } from '@nestjs/common';
import { RouterModule } from './router/router.module';

@Module({
  imports: [CommonModule, RouterModule],
  providers: [],
})
export class AppModule {}
