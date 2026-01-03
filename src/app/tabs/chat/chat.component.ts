import { Component, inject, signal } from '@angular/core';
import { IonContent, IonButton, IonTextarea } from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { MarkdownComponent } from 'ngx-markdown';
import { CameraService } from '@services/camera.service';
import { WineService } from '@services/wine.service';
import { ChatService } from '@services/chat.service';
import { HeaderComponent } from '@components/header/header.component';
import { DatePipe, NgClass } from '@angular/common';
import { ContentService } from '@services/content.service';
import { ErrorCode } from '@errors/error.codes';
import { enChat, frChat } from './chat.component.content';

@Component({
  selector: 'app-chat',
  templateUrl: 'chat.component.html',
  styleUrls: ['chat.component.scss'],
  imports: [
    FormsModule,
    HeaderComponent,
    IonButton,
    IonContent,
    IonTextarea,
    MarkdownComponent,
    NgClass,
    DatePipe,
  ],
})
export class ChatComponent {
  protected readonly chatService = inject(ChatService);
  private readonly cameraService = inject(CameraService);
  private readonly wineService = inject(WineService);
  private readonly contentService = inject(ContentService);

  currentMessage: string = '';
  waiting = signal(false);

  content = this.contentService.registerComponentContent(enChat, frChat, 'ChatComponent');

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
    this.consumeImage(
      (image: string) => this.wineService.readWineMenu(image),
      ErrorCode.READ_MENU_FAILED,
    );
  }

  private async consumeImage(
    consumer: (image: string) => Promise<string>,
    errorCode: ErrorCode,
  ): Promise<void> {
    try {
      this.waiting.set(true);

      const image = await this.cameraService.takePhotoAsBase64();
      if (!image) {
        // user cancelled or no image returned
        return;
      }

      const recommendation = await consumer(image);
      this.chatService.addSystemMessage(recommendation);
    } catch (err: unknown) {
      let msg = String(err);
      if (msg.hasOwnProperty('message')) {
        msg = (err as any).message;
      }
      this.chatService.addSystemMessage(`${this.contentService.translateError(errorCode)}: ${msg}`);
    } finally {
      this.waiting.set(false);
      this.scrollToBottom();
    }
  }

  /**
   * Take a picture of a bottle of wine, send it to the wine service to get more details about
   * it, then append the result to the chat as a system message.
   */
  sumarizeBottle() {
    this.consumeImage(
      (image: string) => this.wineService.summarizeWine(image),
      ErrorCode.BOTTLE_SUMMARIZE_FAILED,
    );
  }
}
