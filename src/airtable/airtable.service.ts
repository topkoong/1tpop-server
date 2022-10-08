import {
  DAILY_VIDEO_INFO_LOGS_TABLE,
  IMAGE_SLIDERS,
  VIDEO_INFO_TABLE,
  VIDEO_URLS_TABLE,
} from './lib/common/airtable.constants';
import { Inject, Injectable } from '@nestjs/common';
import {
  chunk,
  flatten,
  groupBy,
  isEmpty,
  keyBy,
  merge,
  values,
  xor,
} from 'lodash';

import Airtable from 'airtable';
import { ConfigService } from '@nestjs/config';
import { YoutubeService } from 'src/youtube/youtube.service';
import _ from 'lodash';
import moment from 'moment-timezone';
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

  transformVideoCreatePayload(videosInfos: any) {
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
  transformVideoCreateDailyLogsPayload(videosInfos: any) {
    if (!isEmpty(videosInfos)) {
      const transformedVideoInfos = videosInfos?.map((videoInfo: any) => {
        return {
          fields: {
            ...videoInfo,
            date: moment(new Date()).tz('Asia/Bangkok').format('l'),
          },
        };
      });
      return transformedVideoInfos;
    } else {
      console.error('Airtable Video information is not available.');
      throw new Error('Airtable Video information is not available.');
    }
  }

  transformVideoUpdatePayload(videosInfos: any) {
    if (!isEmpty(videosInfos)) {
      const transformedVideoInfos = videosInfos?.map((videoInfo: any) => {
        const {
          airtableId,
          id,
          snippet: { title, publishedAt, thumbnails },
          statistics: { viewCount },
        } = videoInfo;
        const { medium, high, standard, maxres } = thumbnails;
        return {
          id: airtableId,
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

  async getVideoUrls() {
    try {
      const videoUrlrecords = await this.videoUrlsBase(VIDEO_URLS_TABLE)
        .select({ view: 'Grid view' })
        .all();
      const videoUrlsDb = videoUrlrecords.map((record) => record.fields);
      if (!isEmpty(videoUrlsDb)) {
        return videoUrlsDb;
      }
      throw new Error('Airtable Video Urls are not available');
    } catch (error) {
      console.error(error.message);
      // throw new Error('Cannot get video urls from Airtable');
    }
  }

  async getAirtableVideosFieldsInfos() {
    try {
      const videoInfoRecords = await this.videoUrlsBase(VIDEO_INFO_TABLE)
        .select({ view: 'Grid view' })
        .all();
      const videoInfosDb = videoInfoRecords.map((record) => record.fields);
      if (!isEmpty(videoInfosDb)) {
        return videoInfosDb;
      }
      throw new Error('Airtable Video Infos are not available');
    } catch (error) {
      console.error(error.message);
      // throw new Error('Cannot get video infos from Airtable');
    }
  }

  async getAirtableVideosInfos() {
    try {
      const videoInfoRecords = await this.videoUrlsBase(VIDEO_INFO_TABLE)
        .select({ view: 'Grid view' })
        .all();
      if (!isEmpty(videoInfoRecords)) {
        return videoInfoRecords;
      }
      throw new Error('Airtable Video Infos are not available');
    } catch (error) {
      console.error(error.message);
      // throw new Error('Cannot get video infos from Airtable');
    }
  }

  async getNewVideosInfos() {
    try {
      const [videoUrlsDb, videosInfos] = await Promise.all([
        this.getVideoUrls(),
        this.getAirtableVideosFieldsInfos(),
      ]);
      const videoIds = videoUrlsDb?.map((field) =>
        url.parse(field.url as string).pathname?.slice(1),
      );
      if (!isEmpty(videoIds) && !isEmpty(videosInfos)) {
        const videosInfosIds = videosInfos?.map(
          (vdoInfo) => vdoInfo.videoId,
        ) as string[];
        // Creates an array of unique values that is the symmetric difference of the given arrays
        const newVideoIds = xor(videoIds, videosInfosIds);
        if (!isEmpty(newVideoIds)) {
          const youtubeVideosInfos = await this.youtubeService.getVideosInfos(
            newVideoIds as string[],
          );
          return youtubeVideosInfos;
        }
        return [];
      }
      throw new Error('Airtable video id is not available');
    } catch (error) {
      console.error(error.message);
      // throw new Error('Cannot get video urls from Airtable');
    }
  }

  async getYouTubeVideosInfos() {
    try {
      const videoUrlsDb = await this.getVideoUrls();
      const videoIds = videoUrlsDb?.map((field) =>
        url.parse(field.url as string).pathname?.slice(1),
      );
      if (!isEmpty(videoIds)) {
        // YouTube limits the video ids up to 50 ids
        const chunkedTenVideoIds = chunk(videoIds, 50);
        const youtubeVideosInfos = await Promise.all(
          chunkedTenVideoIds.map(
            async (chunkedTenVideoId: any[]) =>
              await this.youtubeService.getVideosInfos(
                chunkedTenVideoId as string[],
              ),
          ),
        );
        if (!isEmpty(flatten(youtubeVideosInfos))) {
          return flatten(youtubeVideosInfos);
        }
        throw new Error('YouTube video information is not available');
      }
      throw new Error('Airtable video id is not available');
    } catch (error) {
      console.error(error.message);
      // throw new Error('Cannot get video urls from Airtable');
    }
  }

  async insertVideoInfos() {
    try {
      const newVideosInfos = await this.getNewVideosInfos();
      if (isEmpty(newVideosInfos)) {
        return {
          message: 'No new videos to insert',
        };
      }
      const transformedVideoInfos =
        this.transformVideoCreatePayload(newVideosInfos);
      if (!isEmpty(transformedVideoInfos)) {
        const res = await this.videoUrlsBase(VIDEO_INFO_TABLE).create(
          transformedVideoInfos,
        );
        return res;
      } else {
        console.error('Airtable Video information is not available.');
        throw new Error('Airtable Video information is not available.');
      }
    } catch (error) {
      console.error(error.message);
      // throw new Error(
      //   'Insert Video Info - Cannot get video information from Airtable',
      // );
    }
  }

  async updateVideoInfos() {
    try {
      const [youtubeVideosInfos, airtableVideosInfos] = await Promise.all([
        this.getYouTubeVideosInfos(),
        this.getAirtableVideosInfos(),
      ]);
      if (!isEmpty(youtubeVideosInfos) && !isEmpty(airtableVideosInfos)) {
        const primaryKeyVideosInfo = airtableVideosInfos?.map(
          ({ id, fields: { videoId } }) => ({
            airtableId: id,
            videoId,
          }),
        );
        const mergedVideoInfos = values(
          merge(
            keyBy(primaryKeyVideosInfo, 'videoId'),
            keyBy(youtubeVideosInfos, 'id'),
          ),
        );
        const transformedVideoInfos =
          this.transformVideoUpdatePayload(mergedVideoInfos);
        if (!isEmpty(transformedVideoInfos)) {
          // Airtable limits the records up to 10 record objects
          const chunkedVideoInfosPayloads = chunk(transformedVideoInfos, 10);
          const res = await Promise.all(
            chunkedVideoInfosPayloads.map(
              async (chunkedVideoInfosPayload: any[]) =>
                await this.videoUrlsBase(VIDEO_INFO_TABLE).update(
                  chunkedVideoInfosPayload,
                ),
            ),
          );
          return res;
        } else {
          console.error('Airtable Video information is not available.');
          throw new Error('Airtable Video information is not available.');
        }
      }
      throw new Error('Cannot get video information from YouTube');
    } catch (error) {
      console.error(error.message);
    }
  }

  async getVideos(sort?: string, limit?: number) {
    try {
      const videoUrlsDb = await this.getVideoUrls();
      const videoInfoRecords = await this.videoUrlsBase(VIDEO_INFO_TABLE)
        .select({
          view: 'Grid view',
          ...(limit && { maxRecords: limit }),
          ...(sort && { sort: [{ field: sort, direction: 'desc' }] }),
        })
        .all();
      const videoInfosDb = videoInfoRecords.map((record) => record.fields);
      const filteredVideoUrlsDb = videoUrlsDb?.filter((vdoUrlDb) =>
        videoInfosDb.find((infoDb) => vdoUrlDb.videoId === infoDb.videoId),
      );
      const result = values(
        merge(
          keyBy(videoInfosDb, 'videoId'),
          keyBy(filteredVideoUrlsDb, 'videoId'),
        ),
      );
      console.log(result);
      return result;
    } catch (error) {
      console.error(error.message);
    }
  }

  async insertDailyVideoInfoLogs() {
    try {
      const airTableVideoInfos = await this.getAirtableVideosFieldsInfos();
      const transformedVideoInfos =
        this.transformVideoCreateDailyLogsPayload(airTableVideoInfos);
      if (!isEmpty(transformedVideoInfos)) {
        // Airtable limits the records up to 10 record objects
        const chunkedVideoInfosPayloads = chunk(transformedVideoInfos, 10);
        const res = await Promise.all(
          chunkedVideoInfosPayloads.map(
            async (chunkedVideoInfosPayload: any[]) =>
              await this.videoUrlsBase(DAILY_VIDEO_INFO_LOGS_TABLE).create(
                chunkedVideoInfosPayload,
              ),
          ),
        );
        return res;
      } else {
        console.error('Airtable Daily Video information is not available.');
        throw new Error('Airtable Daily Video information is not available.');
      }
    } catch (error) {
      console.error(error.message);
    }
  }

  async getDailyVideoInfoLogs() {
    try {
      const dailyVideoInfoRecords = await this.videoUrlsBase(
        DAILY_VIDEO_INFO_LOGS_TABLE,
      )
        .select({ view: 'View by Day' })
        .all();
      const dailyVideoInfoDb = dailyVideoInfoRecords.map(
        (record) => record.fields,
      );
      return groupBy(dailyVideoInfoDb, (video) => video.videoId);
    } catch (error) {
      console.error(error.message);
    }
  }

  async getDailyVideoInfoLog(videoId: string) {
    try {
      const dailyVideoInfoRecords = await this.videoUrlsBase(
        DAILY_VIDEO_INFO_LOGS_TABLE,
      )
        .select({
          view: 'View by Day',
          filterByFormula: `videoId="${videoId}"`,
        })
        .all();
      const dailyVideoInfoDb = dailyVideoInfoRecords.map(
        (record) => record.fields,
      );
      return dailyVideoInfoDb;
    } catch (error) {
      console.error(error.message);
    }
  }

  async getImageSliders() {
    try {
      const imageSlidersRecords = await this.videoUrlsBase(IMAGE_SLIDERS)
        .select({
          view: 'Grid view',
          filterByFormula: 'isActive=1',
          maxRecords: 5,
          sort: [{ field: 'order', direction: 'asc' }],
        })
        .all();
      const imageSlidersDb = imageSlidersRecords.map((record) => record.fields);
      return imageSlidersDb;
    } catch (error) {
      console.error(error.message);
    }
  }
}
