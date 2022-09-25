import { AirTableModule } from './airtable/airtable.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { YoutubeService } from './youtube/youtube.service';
import { YoutubeModule } from './youtube/youtube.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    AirTableModule,
    AuthModule,
    YoutubeModule,
  ],

  controllers: [AppController],
  providers: [AppService, YoutubeService],
})
export class AppModule {}
