export interface User {
  email: string;
  name: string;
}

export interface Detection {
  class: string;
  confidence: number;
  bbox: number[];
}

export interface AnalysisResponse {
  success: boolean;
  message: string;
  detections: {
    count: number;
    classes: Record<string, number>;
    details: Detection[];
  };
  output_image_path: string;
  analysis_summary: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  response: string;
  session_id: string;
}
