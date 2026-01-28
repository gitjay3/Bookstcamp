import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

/**
 * vCPU 2개, RAM 8GB 서버 기준 Connection Pool 설정
 * - max: 15 (CPU 코어 × 2~4 권장, 여유 확보)
 * - idleTimeoutMillis: 30초 (유휴 연결 정리)
 * - connectionTimeoutMillis: 10초 (연결 획득 타임아웃)
 */
const POOL_CONFIG = {
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly config: ConfigService) {
    const databaseUrl = config.getOrThrow<string>('DATABASE_URL');
    const pool = new PrismaPg({
      connectionString: databaseUrl,
      ...POOL_CONFIG,
    });
    super({ adapter: pool });
    this.logger.log(
      `DB Connection Pool 초기화: max=${POOL_CONFIG.max}, timeout=${POOL_CONFIG.connectionTimeoutMillis}ms`,
    );
  }

  async onModuleInit() {
    await this.$connect();
  }
}
