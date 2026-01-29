import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from './encryption.service';

@Injectable()
export class SlackService {
  private readonly logger = new Logger(SlackService.name);
  private clients = new Map<string, WebClient>();

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    private encryptionService: EncryptionService,
  ) {}

  /**
   * 조직별 슬랙 클라이언트를 가져옵니다.
   */
  private async getClient(organizationId?: string): Promise<WebClient | null> {
    if (!organizationId) return null;

    // 캐시된 클라이언트 확인
    if (this.clients.has(organizationId)) {
      return this.clients.get(organizationId) || null;
    }

    // DB에서 조직별 토큰 조회
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: { slackBotToken: true },
    });

    if (org?.slackBotToken) {
      try {
        const decryptedToken = this.encryptionService.decrypt(
          org.slackBotToken,
        );
        const client = new WebClient(decryptedToken);
        this.clients.set(organizationId, client);
        return client;
      } catch (error) {
        this.logger.error(
          `Failed to decrypt Slack token for organization ${organizationId}: ${error}`,
        );
      }
    }

    return null;
  }

  /**
   * 토큰 유효성을 검증하고 워크스페이스 ID를 반환합니다 (auth.test).
   */
  async validateTokenAndGetWorkspaceId(token: string): Promise<string | null> {
    try {
      const tempClient = new WebClient(token);
      const result = await tempClient.auth.test();
      if (result.ok && result.team_id) {
        return result.team_id;
      }
      return null;
    } catch (error) {
      this.logger.error(`Error validating Slack token: ${error}`);
      return null;
    }
  }

  async scheduleReminder(
    organizationId: string | undefined,
    channel: string,
    postAt: number,
    text: string,
  ): Promise<string | undefined> {
    try {
      const client = await this.getClient(organizationId);
      if (!client || !client.token) {
        this.logger.warn(
          `No Slack client found for organization ${organizationId}`,
        );
        return undefined;
      }

      const result = await client.chat.scheduleMessage({
        channel,
        post_at: postAt,
        text,
      });

      if (result.ok) {
        this.logger.log(`Scheduled Slack message to ${channel} at ${postAt}`);
        return result.scheduled_message_id;
      } else {
        this.logger.error(`Failed to schedule Slack message: ${result.error}`);
        return undefined;
      }
    } catch (error) {
      this.logger.error(`Error scheduling Slack message: ${error}`);
      return undefined;
    }
  }

  async deleteScheduledMessage(
    organizationId: string | undefined,
    channel: string,
    scheduledMessageId: string,
  ): Promise<boolean> {
    try {
      const client = await this.getClient(organizationId);
      if (!client || !client.token) {
        this.logger.warn(
          `No Slack client found for organization ${organizationId}`,
        );
        return false;
      }

      const result = await client.chat.deleteScheduledMessage({
        channel,
        scheduled_message_id: scheduledMessageId,
      });

      if (result.ok) {
        this.logger.log(
          `Deleted scheduled Slack message: ${scheduledMessageId} in ${channel}`,
        );
        return true;
      } else {
        this.logger.error(
          `Failed to delete scheduled Slack message: ${result.error}`,
        );
        return false;
      }
    } catch (error) {
      this.logger.error(`Error deleting scheduled Slack message: ${error}`);
      return false;
    }
  }

  async getDmChannelId(
    organizationId: string | undefined,
    userId: string,
  ): Promise<string | undefined> {
    try {
      const client = await this.getClient(organizationId);
      if (!client || !client.token) {
        this.logger.warn(
          `No Slack client found for organization ${organizationId}`,
        );
        return undefined;
      }
      const result = await client.conversations.open({
        users: userId,
      });

      if (result.ok && result.channel?.id) {
        return result.channel.id;
      } else {
        this.logger.error(
          `Failed to open DM channel for user ${userId}: ${result.error}`,
        );
        return undefined;
      }
    } catch (error) {
      this.logger.error(`Error opening DM channel: ${error}`);
      return undefined;
    }
  }

  async getUserProfile(organizationId: string | undefined, userId: string) {
    try {
      const client = await this.getClient(organizationId);
      if (!client || !client.token) {
        this.logger.warn(
          `No Slack client found for organization ${organizationId}`,
        );
        return undefined;
      }

      const result = await client.users.info({
        user: userId,
      });

      if (result.ok && result.user) {
        return {
          displayName: result.user.profile?.display_name,
          realName: result.user.profile?.real_name,
          teamId: result.user.team_id, // 검증용 팀 ID 추가
        };
      } else {
        this.logger.error(`Failed to get Slack user info: ${result.error}`);
        return undefined;
      }
    } catch (error) {
      this.logger.error(`Error getting Slack user profile: ${error}`);
      return undefined;
    }
  }
}
