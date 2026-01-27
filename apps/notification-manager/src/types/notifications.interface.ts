export interface Notification {
  id: number;
  title: string;
  message: string;
  createdAt: Date;
  read: boolean;
  userId?: number | string;
}
