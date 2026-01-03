import { inject, Injectable, signal, computed, OnDestroy } from '@angular/core';
import { WineService } from './wine.service';
import { ResponseContext, TrackResponse } from './track-response.decorator';
import { ResponseLogService } from './response-log.service';
import { ChatMessage } from '@models/chat.model';
import { ContentService } from './content.service';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
/**
 * Manage chat messages, state and interactions.
 */
export class ChatService implements OnDestroy {
  private readonly wineService = inject(WineService);
  private readonly contentService = inject(ContentService);
  // needs to be injected for decorator to work
  protected readonly responseLogService = inject(ResponseLogService);

  messages = signal<ChatMessage[]>([]);
  // computed signal to control whether the flag button should be enabled in the UI
  // enabled when there is at least one message in the chat
  enableFlagButton = computed(() => this.messages().length > 0);

  content = this.contentService.registerComponentContent(
    {
      initialMessage: 'Hello! How can I help you today?',
    },
    {
      initialMessage: "Bonjour! Comment puis-je vous aider aujourd'hui ?",
    },
    'ChatService',
  );

  #subs$ = new Subscription();

  constructor() {
    this.initChatSession();

    this.#subs$.add(
      this.contentService.languageChanges$.subscribe(() => {
        if (this.messages().length === 1) {
          // If there is only the initial system message, re-initialize the chat session.
          // I haven't decided what to do if the language switches mid-conversation, but
          // I assume the LLM can handle it.
          this.initChatSession();
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.#subs$.unsubscribe();
  }

  initChatSession() {
    this.wineService.initSession();
    this.messages = signal<ChatMessage[]>([]);
    this.addSystemMessage(this.content().initialMessage);
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
