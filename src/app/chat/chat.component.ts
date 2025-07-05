import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IonContent, IonButton } from '@ionic/angular/standalone';
import { ChatService } from '../services/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-chat',
  templateUrl: 'chat.component.html',
  styleUrls: ['chat.component.scss'],

  imports: [CommonModule, FormsModule, HeaderComponent, IonButton, IonContent, MarkdownComponent],
})
export class ChatComponent {
  chatService = inject(ChatService);

  currentMessage: string = '';
  waiting = signal(false);

  sendMessage(): void {
    if (this.currentMessage.trim()) {
      this.scrollToBottom();
      this.getChatResponse(this.currentMessage);

      this.currentMessage = '';
    }
  }

  clearChat(): void {
    this.currentMessage = '';
    this.chatService.initChatSession();
    this.scrollToBottom();
  }

  private async getChatResponse(userMessage: string) {
    this.waiting.set(true);
    await this.chatService.invokeChat(userMessage);

    this.waiting.set(false);

    this.scrollToBottom();
  }

  private scrollToBottom() {
    setTimeout(() => {
      // TODO don't query entire document; instead check within component itself
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    });
  }
}
