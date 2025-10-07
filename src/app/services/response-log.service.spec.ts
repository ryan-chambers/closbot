import { TestBed } from '@angular/core/testing';
import { ResponseLogService } from './response-log.service';
import { ResponseContext } from './track-response.decorator';

describe('ResponseLogService', () => {
  let service: ResponseLogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResponseLogService);
    service.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add and list responses', () => {
    service.add('one', ResponseContext.CHAT_RESPONSE);
    service.add('two', ResponseContext.WINE_MENU_TEXT);
    const list = service.list();
    expect(list.length).toBe(2);
    expect(list[0].text).toBe('one');
    expect(list[0].context).toBe(ResponseContext.CHAT_RESPONSE);
    expect(list[1].text).toBe('two');
    expect(list[1].context).toBe(ResponseContext.WINE_MENU_TEXT);
  });

  it('should clear responses', () => {
    service.add('one', ResponseContext.CHAT_RESPONSE);
    service.clear();
    expect(service.list()).toEqual([]);
  });
});
