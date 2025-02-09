import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';

import { ALLOW_EXTENSIONS, MAX_FILE_SIZE_MB } from '../constants';
import { AddFileInterface } from '../types';

@Injectable()
export class FileService {
  checkMaxFileSize(file: File): boolean {
    return file && file.size > MAX_FILE_SIZE_MB * 1024 * 1024;
  }

  getBase64(file: File): Observable<string> {
    return new Observable((observer) => {
      const reader: FileReader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        observer.next(reader.result as string);
      };
      reader.onerror = (error) => {
        observer.error(error);
      };
    });
  }

  getExtension(fileName: string): string {
    return fileName.split('.').pop();
  }

  filterByExtensions(files: File[]): File[] {
    return files.filter(file => ALLOW_EXTENSIONS.includes(this.getExtension(file.name)));
  }

  prepareFiles(files: File[]): Observable<AddFileInterface> {
    return from(files).pipe(
      mergeMap(file => this.getBase64(file).pipe(
        map((fileBase64: string) => ({
          fileName: file.name,
          fileBase64,
          extension: this.getExtension(file.name),
          type: file.type,
          size: file.size,
        }))
      )),
    );
  }
}
