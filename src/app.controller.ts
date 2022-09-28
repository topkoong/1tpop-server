import { Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';

import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @UseGuards(AuthGuard('api-key'))
  getHello() {
    return this.appService.getHello();
  }
  @Get('/videos')
  @UseGuards(AuthGuard('api-key'))
  getVideos() {
    return this.appService.getVideos();
  }

  @Get('/videos/urls')
  @UseGuards(AuthGuard('api-key'))
  getVideoUrls() {
    return this.appService.getVideoUrls();
  }

  @Post('/videos/infos')
  @UseGuards(AuthGuard('api-key'))
  insertVideoInfos() {
    return this.appService.insertVideoInfos();
  }

  @Get('/videos/infos/daily')
  @UseGuards(AuthGuard('api-key'))
  getDailyVideoInfoLogs() {
    return this.appService.getDailyVideoInfoLogs();
  }

  @Get('/videos/:videoId/infos/daily/')
  @UseGuards(AuthGuard('api-key'))
  getDailyVideoInfoLog(@Param('videoId') videoId: string) {
    return this.appService.getDailyVideoInfoLog(videoId);
  }

  @Post('/videos/infos/daily')
  @UseGuards(AuthGuard('api-key'))
  insertDailyVideoInfoLogs() {
    return this.appService.insertDailyVideoInfoLogs();
  }

  @Put('/videos/infos')
  @UseGuards(AuthGuard('api-key'))
  updateVideoInfos() {
    return this.appService.updateVideoInfos();
  }

  @Get('/videos/infos')
  @UseGuards(AuthGuard('api-key'))
  getVideosInfos() {
    return this.appService.getVideosInfos();
  }

  @Get('/videos/newinfos')
  @UseGuards(AuthGuard('api-key'))
  getNewVideosInfos() {
    return this.appService.getNewVideosInfos();
  }
}
