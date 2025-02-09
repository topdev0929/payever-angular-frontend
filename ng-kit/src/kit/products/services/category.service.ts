import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { ConfigService } from './config.service';
import { Category } from '../classes';
import { CategoryInterface } from '../interfaces';

@Injectable()
export class CategoryService {

  constructor(private http: HttpClient,
              private config: ConfigService) {
  }

  createDraftCategory(initialOptions: CategoryInterface): Observable<string> {
    const payload: Category = new Category(initialOptions);
    return this.http.post<string>(`${this.config.apiUrl}/stores/api/v1/business/${this.config.businessSlug}/builder/stores/${this.config.storeId}/category/draft`, payload);
  }

}
