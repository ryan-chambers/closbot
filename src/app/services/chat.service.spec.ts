import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ChatService } from './chat.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('ChatService', () => {
  let service: ChatService;
  const wineServiceMock = jasmine.createSpyObj('WineService', [
    'initSession',
    'invokeChat',
    'flagChat',
  ]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: 'WineService',
          useValue: wineServiceMock,
        },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ChatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
