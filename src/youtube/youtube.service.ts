import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { isEmpty } from 'lodash';

@Injectable()
export class YoutubeService {
  constructor(private configService: ConfigService) {}
  YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/channels';
  YOUTUBE_API_KEY = this.configService.get<string>('YOUTUBE_API_KEY');
  youtube = google.youtube({
    version: 'v3',
    auth: this.YOUTUBE_API_KEY,
  });
  async getVideosInfos(ids: string[]) {
    try {
      const { data } = await this.youtube.videos.list({
        part: ['id, snippet,statistics'],
        id: ids.map((id: string) => id),
      });
      const { items } = data;
      if (!isEmpty(items)) {
        return items;
      }
      throw new Error('YouTube video information is not available');
    } catch (error) {
      console.error(error);
      throw new Error('Cannot get YouTube video information');
    }
  }
}
