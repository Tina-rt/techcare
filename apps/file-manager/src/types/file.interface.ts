export interface FileResponse {
  id: string;
  key: string;
  url: string;
  contentType: string;
  size: number;
  lastModified: Date;
  metadata?: Record<string, any>;
}

export interface UploadResponse {
  key: string;
  url: string;
  etag: string;
  versionId?: string;
}

export interface ListFilesResponse {
  files: FileResponse[];
  total: number;
  continuationToken?: string;
  hasMore: boolean;
}
