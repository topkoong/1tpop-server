import { Controller, Get, Post, Put, UseGuards } from '@nestjs/common';

import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
