import { AnalysisResponse, ChatResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class DentalAPIService {
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}`;
  }

  async uploadXray(file: File): Promise<AnalysisResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('🚀 Uploading file:', file.name);
      console.log('📡 API URL:', `${API_BASE_URL}/api/upload-xray`);

      const response = await fetch(`${API_BASE_URL}/api/upload-xray`, {
        method: 'POST',
        body: formData,
      });

      console.log('📥 Response status:', response.status);
      console.log('📥 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        throw new Error(`Failed to upload X-ray: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Upload successful, full data:', JSON.stringify(data, null, 2));
      
      // Ensure the response matches AnalysisResponse interface
      const analysisResponse: AnalysisResponse = {
        success: data.success ?? true,
        message: data.message ?? '',
        detections: {
          count: data.detections?.count ?? 0,
          classes: data.detections?.classes ?? {},
          details: data.detections?.details ?? []
        },
        output_image_path: data.output_image_path ?? '',
        analysis_summary: data.analysis_summary ?? ''
      };
      
      return analysisResponse;
    } catch (error) {
      console.error('❌ Upload error:', error);
      throw error;
    }
  }

  async sendMessage(message: string): Promise<string> {
    try {
      console.log('💬 Sending message:', message);
      
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          session_id: this.sessionId,
        }),
      });

      console.log('📥 Chat response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to send message');
      }

      const data: ChatResponse = await response.json();
      console.log('✅ Chat response:', data);
      
      return data.response;
    } catch (error) {
      console.error('❌ Chat error:', error);
      throw error;
    }
  }

  async sendMessageStreaming(
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const fullResponse = await this.sendMessage(message);

    const words = fullResponse.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 30));
      onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
    }
  }

  getImageUrl(filename: string): string {
    const url = `${API_BASE_URL}/api/image/${filename}`;
    console.log('🖼️ Image URL:', url);
    return url;
  }

  async getCurrentAnalysis() {
    const response = await fetch(`${API_BASE_URL}/api/current-analysis`);

    if (!response.ok) {
      throw new Error('Failed to get current analysis');
    }

    return response.json();
  }

  async clearSession(): Promise<void> {
    await fetch(`${API_BASE_URL}/api/clear-session/${this.sessionId}`, {
      method: 'DELETE',
    });
  }
}