import { CommonModule } from '@common/common.module';
import { DatabaseModule } from '@modules/database/database.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [CommonModule, DatabaseModule],
  providers: [],
})
export class AppModule {}
