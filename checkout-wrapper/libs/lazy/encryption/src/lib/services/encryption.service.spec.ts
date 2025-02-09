import { TextEncoder, TextDecoder } from 'util';

import { TestBed } from '@angular/core/testing';

import { EncryptionService } from './encryption.service';

Object.assign(global, { TextDecoder, TextEncoder });

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EncryptionService,
      ],
    });
  });

  beforeEach(() => {
    service = TestBed.inject(EncryptionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('encryptWithSalt', () => {
    it('should handle string input', async () => {
      const stringData = 'RandomData';
      const salt = '10';

      const encryptedText = await service.encryptWithSalt(stringData, salt);

      expect(encryptedText).toBeDefined();
      expect(encryptedText).not.toEqual(stringData);
    });

    it('should handle object input', async () => {
      const objectData = { key: 'value' };
      const salt = '10';

      const encryptedText = await service.encryptWithSalt(objectData, salt);

      expect(encryptedText).toBeDefined();
      expect(encryptedText).not.toEqual(JSON.stringify(objectData));
    });
  });

  describe('decryptWithSalt', () => {
    it('should decrypt encrypted string data with salt', async () => {
      const data = 'randomData';
      const salt = '10';

      const encryptedText = await service.encryptWithSalt(data, salt);
      const decryptedText = await service.decryptWithSalt(encryptedText, salt);

      expect(decryptedText).toBeDefined();
      expect(decryptedText).toEqual(data);
    });
  });

  describe('generateKeyAndIv', () => {
    it('should generate key and IV from hash', () => {
      const hash = 'randomHash';

      const { key, iv } = service['generateKeyAndIv'](hash);

      expect(key).toBeDefined();
      expect(iv).toBeDefined();
    });
  });

  describe('hash', () => {
    it('should generate hash using blake2bHex', () => {
      const salt = 'randomSalt';

      const hashedSalt = service['hash'](salt);

      expect(hashedSalt).toBeDefined();
    });
  });


});
