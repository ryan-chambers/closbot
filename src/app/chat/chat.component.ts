import { Component, inject, signal } from '@angular/core';
import { IonContent, IonButton, IonTextarea } from '@ionic/angular/standalone';
import { ChatService } from '../services/chat.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownComponent } from 'ngx-markdown';
import { HeaderComponent } from '../header/header.component';
import { CameraService } from '../services/camera.service';
import { WineService } from '../services/wine.service';

@Component({
  selector: 'app-chat',
  templateUrl: 'chat.component.html',
  styleUrls: ['chat.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonButton,
    IonContent,
    IonTextarea,
    MarkdownComponent,
  ],
})
export class ChatComponent {
  chatService = inject(ChatService);
  cameraService = inject(CameraService);
  wineService = inject(WineService);

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

  flagChat() {
    this.chatService.flagChat();
  }

  /**
   * Take a photo of a wine menu, send it to the wine service for
   * parsing/recommendation, and append the result to the chat as a
   * system message.
   */
  async readMenu(): Promise<void> {
    try {
      this.waiting.set(true);

      const image = await this.cameraService.takePhotoAsBase64();
      if (!image) {
        // user cancelled or no image returned
        return;
      }

      const recommendation = await this.wineService.readWineMenu(image);
      this.chatService.addSystemMessage(recommendation);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      this.chatService.addSystemMessage(`Failed to read menu: ${msg}`);
    } finally {
      this.waiting.set(false);
      this.scrollToBottom();
    }
  }
}
