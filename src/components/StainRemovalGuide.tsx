import type { Detection } from '../lib/api';

interface StainInfo {
  koreanName: string;
  description: string;
  removalMethod: string;
}

const STAIN_GUIDE: Record<string, StainInfo> = {
  'coffee&beverage': {
    koreanName: '음료 얼룩',
    description: '물기가 많이 섞인 연한 얼룩입니다.',
    removalMethod:
      '식초로 적신후 베이킹 소다로 세탁해주세요.',
  },
  'kimchi&food': {
    koreanName: '음식 얼룩',
    description: '붉은 계열의 진한 얼룩입니다.',
    removalMethod:
      '주방세제와 찬물로 닦아내세요',
  },
  pen: {
    koreanName: '볼펜 얼룩',
    description: '볼펜 잉크로 인한 얼룩입니다.',
    removalMethod:
      '물파스나 아세톤으로 지우면 효과적입니다.',
  },
};

const FALLBACK_GUIDE: StainInfo = {
  koreanName: '알 수 없는 얼룩',
  description: '얼룩 종류를 특정하기 어렵습니다.',
  removalMethod:
    '중성세제를 이용해 찬물로 부드럽게 손세탁 후, 세탁 전문가 또는 세탁소에 문의해 보세요.',
};

interface StainRemovalGuideProps {
  detections: Detection[];
}

export default function StainRemovalGuide({ detections }: StainRemovalGuideProps) {
  if (detections.length === 0) return null;

  // 신뢰도 가장 높은 결과 기준으로 안내
  const top = [...detections].sort((a, b) => b.confidence - a.confidence)[0];
  const info = STAIN_GUIDE[top.label] ?? FALLBACK_GUIDE;
  const confidencePct = Math.round(top.confidence * 100);

  return (
    <section
      aria-labelledby="stain-guide-heading"
      aria-live="polite"
      aria-atomic="true"
      className="bg-gray-800 border border-gray-600 rounded-2xl p-6 space-y-4"
    >
      <h2
        id="stain-guide-heading"
        className="text-2xl font-bold text-white"
      >
        얼룩 제거 안내
      </h2>

      <div className="space-y-1">
        <p className="text-purple-300 text-xl font-semibold">
          {info.koreanName}
          <span className="sr-only"> (신뢰도 {confidencePct}퍼센트)</span>
        </p>
        <p className="text-gray-300 text-base" aria-label={`얼룩 설명: ${info.description}`}>
          {info.description}
        </p>
      </div>

      <div
        className="bg-gray-700 rounded-xl p-4"
        aria-label={`제거 방법: ${info.removalMethod}`}
      >
        <p className="text-sm font-semibold text-gray-400 mb-2" aria-hidden="true">
          제거 방법
        </p>
        <p className="text-white text-lg leading-relaxed">{info.removalMethod}</p>
      </div>

      <p className="text-gray-500 text-sm">
        * 얼룩 제거 전 옷의 소재와 세탁 라벨을 반드시 확인하세요.
      </p>
    </section>
  );
}
