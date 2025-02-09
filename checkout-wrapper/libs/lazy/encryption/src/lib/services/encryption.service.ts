import { Buffer } from 'buffer';
import { createCipheriv, createDecipheriv } from 'crypto';

import { Injectable } from '@angular/core';
import { blake2bHex } from 'blakejs';

import { ALGORITHM } from '../constants';

@Injectable()
export class EncryptionService {
  async encryptWithSalt(item: unknown, salt: string): Promise<string> {
    const text = typeof item === 'string' ? item : JSON.stringify(item);
    const { key, iv } = this.generateKeyAndIv(this.hash(salt));
    const cipher = createCipheriv(
      ALGORITHM,
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex'),
    );
    const encryptedText = Buffer.concat([cipher.update(text), cipher.final()]);

    return encryptedText.toString('hex');
  }

  async decryptWithSalt(encryptedText: string, salt: string): Promise<string> {
    const { key, iv } = this.generateKeyAndIv(this.hash(salt));

    const decipher = createDecipheriv(
      ALGORITHM,
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex'),
    );

    let decrypted: Buffer = decipher.update(Buffer.from(encryptedText, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  }

  private generateKeyAndIv(hash: string): { iv: string, key: string} {
    return {
      iv: Buffer.from(hash.substring(64, 96)).slice(0, 16).toString('hex'),
      key: Buffer.from(hash.substring(0, 64)).slice(0, 32).toString('hex'),
    };
  }

  private hash(salt: string): string {
    return blake2bHex(salt);
  }
}
