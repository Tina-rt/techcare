export interface RmqFilePayload {
  buffer:
    | {
        type: string;
        data: number[];
      }
    | Buffer;
  originalname: string;
  mimetype: string;
  size: number;
  folder?: string;
}
