import {Injectable} from '@angular/core';

export interface GuideItem {
  id: string;
  name: string;
  document: string;
}

const GUIDES = [
  {
    id: 'code-review-guidelines',
    name: 'Code review guidelines',
    document: '/assets/guides/html/code-review-guidelines.html'
  },
  {
    id: 'testing',
    name: 'TESTING',
    document: '/assets/guides/html/testing.html'
  },
  {
    id: 'integration',
    name: 'INTEGRATION',
    document: '/assets/guides/html/integration.html'
  }
];

@Injectable()
export class GuideItems {

  getAllItems(): GuideItem[] {
    return GUIDES;
  }

  getItemById(id: string): GuideItem {
    return GUIDES.find(i => i.id === id);
  }
}
