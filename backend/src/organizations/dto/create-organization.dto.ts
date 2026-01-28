import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ description: '조직명', example: '부스트캠프 10기 멤버십' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: '슬랙 봇 토큰', example: 'xoxb-...' })
  @IsString()
  @IsOptional()
  slackBotToken?: string;

  @ApiPropertyOptional({
    description: '슬랙 워크스페이스 ID',
    example: 'T01234567',
  })
  @IsString()
  @IsOptional()
  slackWorkspaceId?: string;
}
