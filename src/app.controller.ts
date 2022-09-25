import { Controller, Get, Post, UseGuards } from '@nestjs/common';

import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  // @Get('/videos')
  // @UseGuards(AuthGuard('api-key'))
  // getVideoUrls() {
  //   return this.appService.getVideoUrls();
  // }
  @Get('/videos')
  @UseGuards(AuthGuard('api-key'))
  getVideoUrls() {
    return this.appService.getVideos();
  }

  @Post('/videos')
  @UseGuards(AuthGuard('api-key'))
  insertVideoInfos() {
    this.appService.insertVideoInfos();
  }

  @Get('/videoinfos')
  @UseGuards(AuthGuard('api-key'))
  getVideosInfos() {
    return this.appService.getVideosInfos();
  }
}
