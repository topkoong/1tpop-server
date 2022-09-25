import { Inject, Injectable } from '@nestjs/common';
import {
  VIDEO_INFO_TABLE,
  VIDEO_URLS_TABLE,
} from './lib/common/airtable.constants';
import { isEmpty, keyBy, merge, values } from 'lodash';

import Airtable from 'airtable';
import { ConfigService } from '@nestjs/config';
import { YoutubeService } from 'src/youtube/youtube.service';
import url from 'url';

interface VideoInfo {
  videoId: string;
  title: string;
  views: string;
  publishedAt: string;
  defaultImageUrl?: string;
  mediumImageUrl?: string;
  highImageUrl?: string;
  standardImageUrl?: string;
  maxresImageUrl?: string;
}

interface VideoInfoField {
  fields: VideoInfo;
}

@Injectable()
export class AirTableService {
  constructor(private configService: ConfigService) {}

  @Inject(YoutubeService)
  private youtubeService: YoutubeService;

  videoUrlsBase = new Airtable({
    apiKey: this.configService.get<string>('AIRTABLE_API_KEY'),
  }).base(this.configService.get<string>('VIDEO_URLS_BASE_ID') as string);

  async getVideosInfos() {
    try {
      const records = await this.videoUrlsBase(VIDEO_URLS_TABLE)
        .select({ view: 'Grid view' })
        .all();
      const urlsDb = records.map((record) => record.fields);
      const videoIds = urlsDb.map((field) =>
        url.parse(field.url as string).pathname?.slice(1),
      );
      if (!isEmpty(videoIds)) {
        console.log('get videoIds');
        const videosInfos = await this.youtubeService.getVideosInfos(
          videoIds as string[],
        );
        if (!isEmpty(videosInfos)) {
          console.log('get videosInfos');
          return videosInfos;
        }
        throw new Error('YouTube video information is not available');
      }
      throw new Error('Airtable video id is not available');
    } catch (error) {
      console.error(error);
      throw new Error('Cannot get video urls from Airtable');
    }
  }

  transformVideoPayload(videosInfos: any) {
    if (!isEmpty(videosInfos)) {
      const transformedVideoInfos = videosInfos?.map((videoInfo: any) => {
        const {
          id,
          snippet: { title, publishedAt, thumbnails },
          statistics: { viewCount },
        } = videoInfo;
        const { medium, high, standard, maxres } = thumbnails;
        return {
          fields: {
            videoId: id,
            title,
            views: +viewCount,
            publishedAt: publishedAt,
            defaultImageUrl: !isEmpty(thumbnails.default)
              ? thumbnails?.default?.url
              : '',
            mediumImageUrl: !isEmpty(medium) ? medium?.url : '',
            highImageUrl: !isEmpty(high) ? high?.url : '',
            standardImageUrl: !isEmpty(standard) ? standard?.url : '',
            maxresImageUrl: !isEmpty(maxres) ? maxres?.url : '',
          },
        };
      });
      return transformedVideoInfos;
    } else {
      console.error('Airtable Video information is not available.');
      throw new Error('Airtable Video information is not available.');
    }
  }

  async insertVideoInfos() {
    try {
      const videosInfos = await this.getVideosInfos();
      const transformedVideoInfos = this.transformVideoPayload(videosInfos);
      if (!isEmpty(transformedVideoInfos)) {
        console.log(
          'transformedVideoInfos: ',
          JSON.stringify(transformedVideoInfos, undefined, 2),
        );
        await this.videoUrlsBase(VIDEO_INFO_TABLE).create(
          transformedVideoInfos,
        );
      } else {
        console.error('Airtable Video information is not available.');
        throw new Error('Airtable Video information is not available.');
      }
    } catch (error) {
      console.error('Cannot get video information from Airtable');
      throw new Error('Cannot get video information from Airtable');
    }
  }

  async getVideos() {
    try {
      const videoUrlrecords = await this.videoUrlsBase(VIDEO_URLS_TABLE)
        .select({ view: 'Grid view' })
        .all();
      const videoUrlDb = videoUrlrecords.map((record) => record.fields);
      const videoInfoRecords = await this.videoUrlsBase(VIDEO_INFO_TABLE)
        .select({ view: 'Grid view' })
        .all();
      const videoInfosDb = videoInfoRecords.map((record) => record.fields);
      const result = values(
        merge(keyBy(videoUrlDb, 'videoId'), keyBy(videoInfosDb, 'videoId')),
      );
      return result;
    } catch (error) {
      console.error(error);
    }
  }
}
