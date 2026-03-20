import type { Detection } from '../lib/api';

interface DetectionResultProps {
  detections: Detection[];
  inferenceTimeMs: number;
}

export default function DetectionResult({ detections, inferenceTimeMs }: DetectionResultProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-base text-gray-400">
        <span>추론 시간</span>
        <span className="font-mono bg-gray-800 px-3 py-1 rounded-lg text-gray-300">
          {inferenceTimeMs.toFixed(2)} ms
        </span>
      </div>

      {detections.length === 0 ? (
        <div
          role="status"
          aria-live="polite"
          className="text-center py-10 text-gray-500"
        >
          <p className="text-2xl font-semibold text-gray-300">탐지된 항목 없음</p>
          <p className="text-base mt-2">이미지에서 탐지된 결과가 없습니다.</p>
        </div>
      ) : (
        <div
          role="status"
          aria-live="polite"
          aria-label={`탐지 결과 ${detections.length}개`}
          className="space-y-3"
        >
          {detections.map((det, idx) => {
            const confidencePct = Math.round(det.confidence * 100);
            const barColor =
              confidencePct >= 80
                ? 'bg-green-500'
                : confidencePct >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500';

            return (
              <div
                key={idx}
                className="bg-gray-800 border border-gray-700 rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-white capitalize">{det.label}</span>
                  <span className="text-lg font-mono text-gray-300">{confidencePct}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${barColor}`}
                    style={{ width: `${confidencePct}%` }}
                    role="meter"
                    aria-valuenow={confidencePct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`신뢰도 ${confidencePct}퍼센트`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
