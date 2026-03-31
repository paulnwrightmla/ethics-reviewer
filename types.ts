
export interface FeedbackItem {
  section: string;
  status: 'compliant' | 'warning' | 'danger';
  observation: string;
  recommendation: string;
}

export interface AnalysisResult {
  summary: string;
  methodologyCritique: string;
  tableAnalysis: {
    table3: string;
    table6: string;
  };
  inconsistencies: string[];
  checklistFeedback: FeedbackItem[];
  overallVerdict: 'Ready' | 'Needs Revisions' | 'Requires Major Changes';
}

export interface Attachment {
  file: File;
  preview: string;
  base64: string;
  mimeType: string;
  extractedText?: string;
}

export interface FileAnalysis {
  fileName: string;
  attachment: Attachment;
  result: AnalysisResult | null;
  status: 'pending' | 'analyzing' | 'completed' | 'error';
  error?: string;
}
