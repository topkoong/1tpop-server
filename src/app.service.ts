import { AirTableService } from './airtable/airtable.service';
import { Injectable } from '@nestjs/common';
@Injectable()
export class AppService {
  constructor(private airtableService: AirTableService) {}
  getHello() {
    return {
      message: `Hello! I'm running`,
    };
  }
  getVideosInfos() {
    return this.airtableService.getAirtableVideosFieldsInfos();
  }
  getNewVideosInfos() {
    return this.airtableService.getNewVideosInfos();
  }
  getVideoUrls() {
    return this.airtableService.getVideoUrls();
  }
  getVideos(sort: string, limit: number) {
    return this.airtableService.getVideos(sort, limit);
  }
  getDailyVideoInfoLog(videoId: string) {
    return this.airtableService.getDailyVideoInfoLog(videoId);
  }
  getDailyVideoInfoLogs() {
    return this.airtableService.getDailyVideoInfoLogs();
  }
  insertVideoInfos() {
    return this.airtableService.insertVideoInfos();
  }
  updateVideoInfos() {
    return this.airtableService.updateVideoInfos();
  }
  insertDailyVideoInfoLogs() {
    return this.airtableService.insertDailyVideoInfoLogs();
  }
  getImageSliders() {
    return this.airtableService.getImageSliders();
  }
}
