import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [YoutubeService],
  exports: [YoutubeService],
})
export class YoutubeModule {}
