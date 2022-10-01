import {
  Controller,
  Get,
  Param,
  Query,
  Post,
  Put,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { ApiQuery, ApiPropertyOptional } from '@nestjs/swagger';

export class SortDTO {
  @ApiPropertyOptional({
    default: 'views',
    description:
      'A list of sort videos that specifies how the videos will be ordered. Each sort video must have a field key specifying the name of the field to sort on, and an optional direction key that is either "asc" or "desc". The default direction is "desc".',
  })
  sort: string;
}

export class LimitDTO {
  @ApiPropertyOptional({
    default: 100,
    description:
      'The maximum total number of videos that will be returned in your requests.',
  })
  limit: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  @UseGuards(AuthGuard('api-key'))
  getHello() {
    return this.appService.getHello();
  }
  @Get('/videos')
  @ApiQuery({
    name: 'sort',
    type: SortDTO,
  })
  @ApiQuery({
    name: 'limit',
    type: LimitDTO,
  })
  @UseGuards(AuthGuard('api-key'))
  getVideos(
    @Query('sort') sort = 'views',
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit = 100,
  ) {
    return this.appService.getVideos(sort, limit);
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
  @Get('/images/sliders')
  @UseGuards(AuthGuard('api-key'))
  getImageSliders() {
    return this.appService.getImageSliders();
  }
}
