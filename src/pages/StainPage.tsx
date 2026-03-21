import { useState } from 'react';
import ImageUploader from '../components/ImageUploader';
import ResultCanvas from '../components/ResultCanvas';
import DetectionResult from '../components/DetectionResult';
import { analyzeImage } from '../lib/api';
import type { Detection } from '../lib/api';

interface StainPageProps {
  mode: 'detect' | 'classify';
  onBack: () => void;
}

const CONFIG = {
  detect: {
    endpoint: '/stain/detect' as const,
    label: '의류 얼룩 탐지',
    description: '옷에 얼룩이 있는지 찾아드립니다',
    buttonColor: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-400',
    actionLabel: '옷 얼룩 존재 확인',
  },
  classify: {
    endpoint: '/stain/classify' as const,
    label: '의류 얼룩 분류',
    description: '얼룩의 종류를 알려드립니다',
    buttonColor: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-400',
    actionLabel: '얼룩 종류 분석',
  },
};

export default function StainPage({ mode, onBack }: StainPageProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[] | null>(null);
  const [inferenceTimeMs, setInferenceTimeMs] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { endpoint, label, description, buttonColor, actionLabel } = CONFIG[mode];

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
      const result = await analyzeImage(endpoint, imageFile);
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
          <h1 className="text-3xl font-extrabold text-white">{label}</h1>
          <p className="text-gray-400 text-base mt-1">{description}</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6 px-6 pb-10">
        <ImageUploader onImage={handleImage} />

        {previewUrl && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            aria-label={loading ? '분석 중입니다. 잠시 기다려주세요.' : actionLabel}
            className={`
              w-full min-h-[80px] rounded-2xl text-white text-2xl font-bold
              transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-gray-950
              disabled:opacity-50 disabled:cursor-not-allowed
              ${buttonColor}
            `}
          >
            {loading ? '분석 중...' : actionLabel}
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
