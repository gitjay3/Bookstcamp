import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;
  private readonly logger = new Logger(EncryptionService.name);

  constructor(private configService: ConfigService) {
    const keyString = this.configService.get<string>(
      'SLACK_TOKEN_ENCRYPTION_KEY',
    );
    if (!keyString) {
      this.logger.warn(
        'SLACK_TOKEN_ENCRYPTION_KEY is not defined. Using a temporary key for development. DO NOT USE IN PRODUCTION.',
      );
      // Fallback for development only. In production, this must be defined.
      this.key = crypto.scryptSync('temporary-dev-key', 'salt', 32);
    } else {
      // Key should be 32 bytes for aes-256
      this.key = crypto.scryptSync(keyString, 'slack-salt', 32);
    }
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    // Format: iv:encrypted:authTag
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  }

  decrypt(combined: string): string {
    const [ivHex, encryptedHex, authTagHex] = combined.split(':');
    if (!ivHex || !encryptedHex || !authTagHex) {
      throw new Error('Invalid encrypted format');
    }

    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}
