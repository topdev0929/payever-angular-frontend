// tslint:disable max-classes-per-file

import { NgModule, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { FullStoryModule } from './full-story.module';
import { FullStoryService } from './services';

describe('FullStoryModule', () => {
  it('should provide FullStory service by the module', () => {
    @Injectable()
    class TestService {
      constructor (
        public fullStory: FullStoryService
      ) {}
    }

    @NgModule({
      providers: [TestService],
      imports: [FullStoryModule]
    })
    class TestModule {}

    TestBed.configureTestingModule({
      imports: [TestModule]
    });

    const testService: TestService = TestBed.get(TestService);
    expect(testService).toBeTruthy();
    expect(testService.fullStory).toBeDefined();
    expect(testService.fullStory instanceof FullStoryService).toBe(true);

    const fsService: TestService = TestBed.get(FullStoryService);
    expect(fsService).toBeTruthy();
    expect(fsService instanceof FullStoryService).toBe(true);
  });
});
