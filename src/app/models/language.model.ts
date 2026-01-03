export type SupportedLanguage = 'en' | 'fr';

/**
 * Content bundles. Leading C is to distinguish the content bundles from
 * other classes in the app.
 */

export interface CGalleryComponent {
  edit: string;
  delete: string;
  noPhotos: string;
  deleteConfirm: string;
  yes: string;
  no: string;
}

export interface CVintageReportComponent {
  vintageReport: string;
  regionalGuidelines: string;
  year: string;
  reds: string;
  whites: string;
  notes: string;
}

export interface CHeaderComponent {
  useRealServices: string;
}

export interface CResponseLogService {
  logRecorded: string;
}

export interface CAppContent {
  galleryComponent: CGalleryComponent;
  vintageReportComponent: CVintageReportComponent;
  headerComponent: CHeaderComponent;
  responseLogService: CResponseLogService;
}
