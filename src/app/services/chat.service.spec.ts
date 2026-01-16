import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ChatService } from './chat.service';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { WineService } from './wine.service';

describe('ChatService', () => {
  let service: ChatService;
  const wineServiceMock: Partial<WineService> = {
    initSession: vi.fn(),
    invokeChat: vi.fn(),
    flagChat: vi.fn(),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: WineService,
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
