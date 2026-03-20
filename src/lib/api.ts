export interface Detection {
  label: string;
  confidence: number;
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

export interface AnalysisResult {
  detections: Detection[];
  inference_time_ms: number;
}

export async function analyzeImage(
  endpoint: string,
  file: File
): Promise<AnalysisResult> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL ?? '';
  const url = `${baseUrl}${endpoint}`;

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data: AnalysisResult = await response.json();
  return data;
}
