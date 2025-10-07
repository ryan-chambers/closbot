import { inject, Injectable, signal } from '@angular/core';
import { ChatMessage } from '../models/chat.model';
import { WineService } from './wine.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Manage chat messages, state and interactions.
 */
export class ChatService {
  wineService = inject(WineService);

  messages = signal<ChatMessage[]>([]);

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

  addUserMessage(content: string) {
    const userMessage: ChatMessage = {
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    this.messages.update((messages) => [...messages, userMessage]);
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
