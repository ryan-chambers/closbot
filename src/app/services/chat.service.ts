import { inject, Injectable, signal, computed } from '@angular/core';
import { ChatMessage } from '../models/chat.model';
import { WineService } from './wine.service';
import { ResponseContext, TrackResponse } from './track-response.decorator';
import { ResponseLogService } from './response-log.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Manage chat messages, state and interactions.
 */
export class ChatService {
  wineService = inject(WineService);
  responseLogService = inject(ResponseLogService);

  messages = signal<ChatMessage[]>([]);
  // computed signal to control whether the flag button should be enabled in the UI
  // enabled when there is at least one message in the chat
  enableFlagButton = computed(() => this.messages().length > 0);

  constructor() {
    this.initChatSession();
  }

  initChatSession() {
    this.wineService.initSession();
    this.messages = signal<ChatMessage[]>([]);
    this.addSystemMessage('Hello! How can I help you today?');
  }

  addSystemMessage(content: string) {
    const systemMessage: ChatMessage = {
      content,
      sender: 'system',
      timestamp: new Date(),
    };
    this.messages.update((messages) => [...messages, systemMessage]);
  }

  @TrackResponse(ResponseContext.USER_MESSAGE)
  addUserMessage(content: string) {
    const userMessage: ChatMessage = {
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    this.messages.update((messages) => [...messages, userMessage]);

    // kind of a hack, but for now the decorator needs a return value to log
    return content;
  }

  async invokeChat(userMessage: string): Promise<void> {
    this.addUserMessage(userMessage);
    const response = await this.wineService.invokeChat(userMessage);
    this.addSystemMessage(response);
  }

  async flagChat(): Promise<void> {
    return await this.wineService.flagChat();
  }
}
