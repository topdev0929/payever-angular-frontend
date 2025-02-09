import { TestBed } from '@angular/core/testing';

import { LocationService } from './location.service';
import { LocationStubService } from './location.stub.service';
import { nonRecompilableTestModuleHelper } from '../../../../test';
import { LocationTestingModule } from '../../../testing/location-testing.module';

describe('LocationService', () => {
  let service: LocationService;
  let serviceMock: LocationStubService;

  nonRecompilableTestModuleHelper({
    imports: [
      LocationTestingModule
    ]
  });

  beforeEach(() => {
    service = TestBed.get(LocationService);
    serviceMock = service as LocationStubService;
  });

  it('Has correct hash', () => {
    service.hash = 'abv';
    expect(service.hash).toEqual('abv', 'Should be saved');
  });

  it('Has correct host', () => {
    expect(!!service.host).toBeTruthy('Should not be empty');
    service.host = '123';
    expect(service.host).toEqual('123', 'Should be saved');
  });

  it('Has correct hostname', () => {
    expect(!!service.hostname).toBeTruthy('Should not be empty');
    service.hostname = 'test.test';
    expect(service.hostname).toEqual('test.test', 'Should be saved');
  });

  it('Has correct href', () => {
    expect(!!service.href).toBeTruthy('Should not be empty');
    service.href = 'http://test.test/';
    expect(service.href).toEqual('http://test.test/', 'Should be saved');
  });

  it('Has correct origin', () => {
    expect(!!service.origin).toBeTruthy('Should not be empty');
  });

  it('Has correct pathname', () => {
    expect(!!service.pathname).toBeTruthy('Should not be empty');
    service.pathname = 'abc';
    expect(service.pathname).toEqual('abc', 'Should be saved');
  });

  it('Has correct port', () => {
    expect(!!service.port).toBeTruthy('Should not be empty');
    service.port = '1234';
    expect(service.port).toEqual('1234', 'Should be saved');
  });

  it('Has correct protocol', () => {
    expect(!!service.protocol).toBeTruthy('Should not be empty');
    service.protocol = 'https';
    expect(service.protocol).toEqual('https', 'Should be saved');
  });

  it('Has correct search', () => {
    service.search = 'xxx';
    expect(service.search).toEqual('xxx', 'Should be saved');
  });

  it('should assign in browser', () => {
    service.assign('http://example.com/1');
    expect(serviceMock.assigned).toBe('http://example.com/1', 'Compnent opened new page in browser');
  });

  it('shoud reload app', () => {
    expect(serviceMock.reloaded).toBe(false, 'Page was not reloaded before');
    service.reload();
    // Karma test page didn't reloaded here!
    expect(serviceMock.reloaded).toBe(true, 'Page was reloaded after reloadApp() call');
  });

  it('should replace url in browser', () => {
    service.replace('http://example.com/2');
    expect(serviceMock.replaced).toBe('http://example.com/2', 'Compnent opened new page in browser');
  });
});
