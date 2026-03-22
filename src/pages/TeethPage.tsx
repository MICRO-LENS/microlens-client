import { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import ResultCanvas from '../components/ResultCanvas';
import DetectionResult from '../components/DetectionResult';
import { analyzeImage } from '../lib/api';
import type { Detection } from '../lib/api';

interface TeethPageProps {
  onBack: () => void;
}

export default function TeethPage({ onBack }: TeethPageProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[] | null>(null);
  const [inferenceTimeMs, setInferenceTimeMs] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImage = (file: File, url: string) => {
    setImageFile(file);
    setPreviewUrl(url);
    setDetections(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeImage('/teeth/check', imageFile);
      setDetections(result.detections);
      setInferenceTimeMs(result.inference_time_ms);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="px-6 pt-10 pb-6 flex items-start gap-4">
        <button
          onClick={onBack}
          aria-label="홈으로 돌아가기"
          className="mt-1 text-gray-400 hover:text-white text-2xl focus:outline-none focus:ring-2 focus:ring-white rounded"
        >
          ←
        </button>
        <div>
          <h1 className="text-3xl font-extrabold text-white">치아 이물질 탐지</h1>
          <p className="text-gray-400 text-base mt-1">치아에 이물질이 있는지 확인해드립니다</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6 px-6 pb-10">
        <ImageUploader onImage={handleImage} />

        {previewUrl && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            aria-label={loading ? '분석 중입니다. 잠시 기다려주세요.' : '치아 분석하기'}
            className={`
              w-full min-h-[80px] rounded-2xl text-white text-2xl font-bold
              bg-teal-600 hover:bg-teal-700 transition-colors
              focus:outline-none focus:ring-4 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-gray-950
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {loading ? '분석 중...' : '치아 분석하기'}
          </button>
        )}

        {error && (
          <div
            role="alert"
            className="bg-red-900/50 border border-red-500 text-red-300 rounded-2xl p-5 text-lg"
          >
            오류: {error}
          </div>
        )}

        {detections !== null && previewUrl && (
          <div className="space-y-4">
            <ResultCanvas imageUrl={previewUrl} detections={detections} />
            <DetectionResult detections={detections} inferenceTimeMs={inferenceTimeMs} />
          </div>
        )}
      </main>
    </div>
  );
}
