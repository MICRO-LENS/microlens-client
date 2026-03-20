import { useRef, useState, useCallback, useEffect } from 'react';

interface ImageUploaderProps {
  onImage: (file: File, previewUrl: string) => void;
}

export default function ImageUploader({ onImage }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드할 수 있습니다.');
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImage(file, url);
    },
    [onImage]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setStream(mediaStream);
      setCameraActive(true);
    } catch (err) {
      alert('카메라에 접근할 수 없습니다: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        onImage(file, url);
        stopCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [cameraActive, stream]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, [stream]);

  return (
    <div className="space-y-4">
      {cameraActive ? (
        <div className="relative rounded-2xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full object-contain"
            style={{ maxHeight: '60vh' }}
          />
          <div className="flex gap-3 p-4 bg-black/60 absolute bottom-0 left-0 right-0">
            <button
              onClick={capturePhoto}
              aria-label="사진 촬영"
              className="flex-1 min-h-[56px] bg-white text-black text-lg font-bold rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
            >
              촬영
            </button>
            <button
              onClick={stopCamera}
              aria-label="카메라 취소"
              className="flex-1 min-h-[56px] bg-red-600 text-white text-lg font-bold rounded-xl hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              취소
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-400 bg-blue-950/30'
                : 'border-gray-700 hover:border-gray-500 bg-gray-900'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            aria-label="이미지를 드래그하거나 클릭하여 업로드"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <p className="text-gray-300 text-xl font-medium">이미지 업로드</p>
            <p className="text-gray-500 text-base mt-1">클릭 또는 드래그</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>

          <button
            onClick={startCamera}
            aria-label="카메라로 사진 촬영하기"
            className="w-full min-h-[64px] bg-gray-800 hover:bg-gray-700 text-white text-xl font-bold rounded-2xl transition-colors focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-950"
          >
            카메라로 촬영
          </button>
        </>
      )}

      {previewUrl && !cameraActive && (
        <div className="rounded-2xl overflow-hidden border border-gray-700">
          <p className="text-sm text-gray-500 px-4 py-2 bg-gray-900 border-b border-gray-700">
            선택된 이미지
          </p>
          <img
            src={previewUrl}
            alt="선택된 이미지 미리보기"
            className="w-full object-contain"
            style={{ maxHeight: '50vh' }}
          />
        </div>
      )}
    </div>
  );
}
