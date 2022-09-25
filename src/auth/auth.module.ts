import { ConfigModule } from '@nestjs/config';
import { HeaderApiKeyStrategy } from './auth-header-api-key.strategy';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule, ConfigModule],
  providers: [HeaderApiKeyStrategy],
})
export class AuthModule {}
