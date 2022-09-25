import { AirTableService } from './airtable.service';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { YoutubeModule } from '../youtube/youtube.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    YoutubeModule,
  ],
  providers: [AirTableService],
  exports: [AirTableService],
})
export class AirTableModule {}
