export type SupportedLanguage = 'en' | 'fr';

/**
 * Content bundles. Leading C is to distinguish the content bundles from
 * other classes in the app.
 */

export interface CVintageReportComponent {
  vintageReport: string;
  regionalGuidelines: string;
  year: string;
  reds: string;
  whites: string;
  notes: string;
}

export interface CResponseLogService {
  logRecorded: string;
}

export interface CAppContent {
  vintageReportComponent: CVintageReportComponent;
  responseLogService: CResponseLogService;
}
