import { AirTableService } from './airtable/airtable.service';
import { Injectable } from '@nestjs/common';
@Injectable()
export class AppService {
  constructor(private airtableService: AirTableService) {}
  getVideosInfos() {
    return this.airtableService.getVideosInfos();
  }
  getVideos() {
    return this.airtableService.getVideos();
  }
  insertVideoInfos() {
    return this.airtableService.insertVideoInfos();
  }
}
