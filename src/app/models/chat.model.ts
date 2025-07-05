export interface ChatMessage {
  content: string;
  sender: 'user' | 'system';
  timestamp: Date;
}
