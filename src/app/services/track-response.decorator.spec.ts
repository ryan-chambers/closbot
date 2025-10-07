import { TestBed } from '@angular/core/testing';
import { ResponseLogService } from './response-log.service';
import { ResponseContext, TrackResponse } from './track-response.decorator';

class TestService {
  constructor(public responseLogService: ResponseLogService) {}

  @TrackResponse(ResponseContext.CHAT_RESPONSE)
  sync(): string {
    return 'sync-result';
  }

  @TrackResponse(ResponseContext.CHAT_RESPONSE)
  async asyncResult(): Promise<string> {
    return Promise.resolve('async-result');
  }

  @TrackResponse(ResponseContext.CHAT_RESPONSE)
  async returnsNumber(): Promise<number> {
    return Promise.resolve(123);
  }
}

describe('TrackResponse decorator', () => {
  let responseLogService: ResponseLogService;
  let svc: TestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ResponseLogService],
    });
    responseLogService = TestBed.inject(ResponseLogService);
    responseLogService.clear();
    svc = new TestService(responseLogService);
  });

  it('logs synchronous string returns', () => {
    const r = svc.sync();
    expect(r).toBe('sync-result');
    const list = responseLogService.list();
    expect(list.length).toBe(1);
    expect(list[0].text).toBe('sync-result');
    expect(list[0].context).toBe(ResponseContext.CHAT_RESPONSE);
  });

  it('logs async string results', async () => {
    const p = svc.asyncResult();
    const r = await p;
    expect(r).toBe('async-result');
    const list = responseLogService.list();
    expect(list.length).toBe(1);
    expect(list[0].text).toBe('async-result');
    expect(list[0].context).toBe(ResponseContext.CHAT_RESPONSE);
  });
});
