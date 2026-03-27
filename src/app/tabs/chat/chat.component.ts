import { Component, inject, signal } from '@angular/core';
import {
  IonContent,
  IonButton,
  IonTextarea,
  ActionSheetController,
} from '@ionic/angular/standalone';
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
import { CameraSource } from '@capacitor/camera';

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
  private readonly actionSheetCtrl = inject(ActionSheetController);

  currentMessage = '';
  waiting = signal(false);

  content = this.contentService.registerComponentContent(enChat, frChat, 'ChatComponent');

  sendMessage(): void {
    if (this.currentMessage.trim()) {
      this.scrollToNextMessage();
      this.getChatResponse(this.currentMessage);

      this.currentMessage = '';
    }
  }

  clearChat(): void {
    this.currentMessage = '';
    this.chatService.initChatSession();
    this.scrollToNextMessage();
  }

  private async getChatResponse(userMessage: string) {
    this.waiting.set(true);
    await this.chatService.invokeChat(userMessage);

    this.waiting.set(false);

    this.scrollToNextMessage();
  }

  private scrollToNextMessage() {
    setTimeout(() => {
      const messages: Element[] = Array.from(document.querySelectorAll('.message-header'));
      if (messages.length > 0) {
        messages[messages.length - 1].scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  flagChat() {
    this.chatService.flagChat();
  }

  private async consumeImage(
    source: CameraSource,
    // The consumer will take the image from source and do something with it
    consumer: (image: string) => Promise<string>,
    errorCode: ErrorCode,
  ): Promise<void> {
    try {
      this.waiting.set(true);

      const image = await this.cameraService.takePhotoAsBase64(source);
      if (!image) {
        // user cancelled or no image returned
        return;
      }

      const recommendation = await consumer(image);
      this.chatService.addSystemMessage(recommendation);
      this.scrollToNextMessage();
    } catch (err: unknown) {
      let msg = String(err);
      if (Object.prototype.hasOwnProperty.call(err, 'message')) {
        // checked for existence of message above
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        msg = (err as any).message;
      }
      this.chatService.addSystemMessage(`${this.contentService.translateError(errorCode)}: ${msg}`);
      this.scrollToNextMessage();
    } finally {
      this.waiting.set(false);
    }
  }

  private summarizeBottleFromSource(source: CameraSource) {
    this.consumeImage(
      source,
      (image: string) => this.wineService.summarizeWine(image),
      ErrorCode.BOTTLE_SUMMARIZE_FAILED,
    );
  }

  /**
   * Take a picture of a bottle of wine, send it to the wine service to get more details about
   * it, then append the result to the chat as a system message.
   */
  async summarizeBottle() {
    this.createAndPresentActionSheet((source) => this.summarizeBottleFromSource(source));
  }

  /**
   * Take a photo of a wine menu, send it to the wine service for
   * parsing/recommendation, and append the result to the chat as a
   * system message.
   */
  async readMenu(): Promise<void> {
    this.createAndPresentActionSheet((source) =>
      this.consumeImage(
        source,
        (image: string) => this.wineService.readWineMenu(image),
        ErrorCode.READ_MENU_FAILED,
      ),
    );
  }

  async createAndPresentActionSheet(handler: (source: CameraSource) => void) {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: [
        {
          text: this.content().takePhoto,
          handler: () => handler(CameraSource.Camera),
        },
        {
          text: this.content().chooseFromLibrary,
          handler: () => handler(CameraSource.Photos),
        },
        {
          text: this.content().cancel,
          role: 'cancel',
        },
      ],
    });
    await actionSheet.present();
  }
}
