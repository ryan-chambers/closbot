import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ResponseLogService } from './response-log.service';
import { ResponseContext } from './track-response.decorator';
import { Filesystem } from '@capacitor/filesystem';

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

  describe('#list', () => {
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

  describe('#recordResponseLogs', () => {
    it('should do nothing when there are no messages', () => {
      const spy = spyOn(service, 'clear');

      service.recordResponseLogs();

      expect(spy).not.toHaveBeenCalled();
    });

    // TODO doesn't work. Could always extract Filesystem interaction to its own service
    // it('should write message using plugin on native app', fakeAsync(() => {
    //   spyOn(service['platform'], 'is').and.returnValue(true);

    //   const spy = spyOn(Filesystem, 'appendFile').and.returnValue(Promise.resolve());

    //   service.add('one', ResponseContext.CHAT_RESPONSE);
    //   service.recordResponseLogs();

    //   flush();
    //   expect(spy).toHaveBeenCalledOnceWith(
    //     jasmine.objectContaining({
    //       data: jasmine.stringMatching(/CHAT_RESPONSE : one/),
    //     }),
    //   );
    // }));
  });

  describe('#generateLogFileLine', () => {
    it('should generate log file line with timestamp and responses', () => {
      const responseLog = 'hi';
      const logLine = service['generateLogFileLine'](responseLog);

      const lines = logLine.split('\n');
      expect(lines.length).toBe(2);
      expect(lines[0]).toMatch(/^[A-Za-z]{3} [A-Za-z]{3} \d{2} \d{4} \d{2}:\d{2}:\d{2}:/);
      expect(lines[1].trim()).toBe('hi');
    });
  });
});
