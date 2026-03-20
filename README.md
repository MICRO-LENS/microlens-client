# microlens-client

MicroLens 프로젝트의 웹 클라이언트 저장소입니다.
React + Vite 기반으로 의류 얼룩 탐지/분류, 치아 이물질 탐지 결과를 브라우저에서 바로 확인할 수 있습니다.

---

## 왜 Android가 아닌 웹인가

기존 온디바이스 구조(YOLOv5 + TFLite)에서는 카메라 실시간 추론이 가능했습니다.
현재 구조는 서버 GPU 추론 기반(YOLOv8 ONNX)으로 전환되었기 때문에 실시간 스캔보다 **정밀 1회 분석**이 핵심 UX입니다.

이 경우 웹 클라이언트가 더 적합합니다:

- **즉시 데모 가능**: APK 설치 없이 URL 하나로 접근
- **카메라 지원**: 브라우저 `getUserMedia` API로 촬영 가능
- **파일 업로드**: 갤러리/드래그앤드롭 이미지 분석

## 왜 React + Vite인가

이 앱의 역할은 **이미지 업로드 → API 호출 → 결과 표시** 가 전부입니다.
빌드 결과물이 순수 정적 파일(HTML/JS/CSS)이므로 nginx 컨테이너 하나로 K8s에 배포할 수 있고,
기존 Jenkins → ECR → ArgoCD 파이프라인을 그대로 재사용합니다.

---

## 기술 스택

| 분류 | 기술 |
|------|------|
| 프레임워크 | React 18 + Vite |
| 언어 | TypeScript |
| 스타일링 | Tailwind CSS |
| HTTP 클라이언트 | fetch (multipart/form-data) |
| 카메라 | `getUserMedia` API |
| 컨테이너 | nginx (정적 파일 서빙) |

---

## 주요 기능 계획

### 1. 이미지 입력
- 카메라 촬영 (모바일/데스크톱 브라우저)
- 파일 업로드 (드래그앤드롭 포함)

### 2. 분석 서비스 선택
- 의류 얼룩 탐지 (`POST /stain/detect`) — GPU 추론
- 의류 얼룩 분류 (`POST /stain/classify`) — CPU 추론
- 치아 이물질 탐지 (`POST /teeth/check`) — GPU 추론

### 3. 결과 시각화
- 바운딩 박스 오버레이 (Canvas API)
- 레이블 + 신뢰도 표시
- 추론 시간(ms) 표시

---

## 디렉토리 구조 (예정)

```
microlens-client/
├── src/
│   ├── App.tsx
│   ├── pages/
│   │   ├── StainPage.tsx       # 얼룩 탐지/분류 페이지
│   │   └── TeethPage.tsx       # 치아 이물질 탐지 페이지
│   ├── components/
│   │   ├── ImageUploader.tsx   # 카메라 촬영 + 파일 업로드
│   │   ├── ResultCanvas.tsx    # 바운딩 박스 오버레이
│   │   └── DetectionResult.tsx # 탐지 결과 카드
│   └── lib/
│       └── api.ts              # AI API 호출 함수
├── nginx.conf                  # 정적 파일 서빙 설정
├── Dockerfile                  # nginx 기반 멀티 스테이지 빌드
├── docker-compose.yml          # 로컬 빌드 검증용
├── .env.example
└── index.html
```

---

## 배포 흐름

기존 AI API 서비스들과 동일한 파이프라인을 사용합니다.

```
GitHub Push
  → Jenkins: docker build (nginx + 정적 파일) → ECR Push
  → kustomize 이미지 태그 업데이트 → git push
  → ArgoCD: K8s 자동 배포
  → Nginx Ingress: / → microlens-client 서비스
```

---

## 환경 변수

```env
VITE_API_BASE_URL=http://<ingress-nginx-external-ip>
```

---

## 로컬 개발

```bash
npm install
npm run dev
# http://localhost:5173
```

---

## 관련 저장소

- [microlens-infra](../microlens-infra) — AWS 인프라 및 Kubernetes 배포
- [microlens-ai-api](../microlens-ai-api) — FastAPI AI 추론 서버
