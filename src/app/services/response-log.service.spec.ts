import { beforeEach, expect, it, describe, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ResponseLogService } from './response-log.service';
import { ResponseContext } from './track-response.decorator';
import { ToastService } from './toast.service';
import { Filesystem } from '@capacitor/filesystem';

vi.mock('@capacitor/filesystem', () => ({
  Filesystem: {
    appendFile: vi.fn(),
  },
  Directory: {},
  Encoding: {},
}));

describe('ResponseLogService', () => {
  let service: ResponseLogService;

  const mockToastService: Partial<ToastService> = {
    showToast: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: ToastService, useValue: mockToastService }],
    });

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
      const spy = vi.spyOn(service, 'clear');

      service.recordResponseLogs();

      expect(spy).not.toHaveBeenCalled();
    });

    it('should write message using plugin on native app', () => {
      const clearSpy = vi.spyOn(service, 'clear');
      vi.spyOn(service['platform'], 'is').mockReturnValue(true);

      const appendFileSpy = vi.spyOn(Filesystem, 'appendFile').mockResolvedValue();

      service.add('one', ResponseContext.CHAT_RESPONSE);
      service.recordResponseLogs();

      expect(clearSpy).toHaveBeenCalled();
      expect(appendFileSpy).toHaveBeenCalled();
    });
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
