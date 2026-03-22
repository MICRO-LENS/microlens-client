import { useState } from 'react';

interface ContactPageProps {
  onBack: () => void;
}

const DEVELOPER_EMAIL = import.meta.env.VITE_CONTACT_EMAIL ?? 'dev@microlens.com';

export default function ContactPage({ onBack }: ContactPageProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (!message.trim()) return;

    const subject = encodeURIComponent('[Microlens] 기능 요청 / 불편함 전달');
    const body = encodeURIComponent(message);
    window.location.href = `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;
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
          <h1 className="text-3xl font-extrabold text-white">개발자에게 메일 쓰기</h1>
          <p className="text-gray-400 text-base mt-1">
            일상에서 불편한 점이나 만들어줬으면 하는 기능을 알려주세요
          </p>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-6 px-6 pb-10">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="예) 화장이 잘되었는지 카메라로 찍으면 알려주는 기능이 있으면 좋겠어요."
          aria-label="개발자에게 보낼 메시지를 입력하세요"
          rows={8}
          className="
            w-full rounded-2xl bg-gray-800 text-white text-xl
            placeholder-gray-500 p-6 resize-none
            border-2 border-gray-700 focus:border-gray-400
            focus:outline-none focus:ring-2 focus:ring-gray-400
            leading-relaxed
          "
        />

        <button
          onClick={handleSend}
          disabled={!message.trim()}
          aria-label="메일 앱을 열어 메시지를 보냅니다"
          className="
            w-full min-h-[80px] rounded-2xl text-white text-2xl font-bold
            bg-gray-700 hover:bg-gray-600 transition-colors
            focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-950
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          메일 보내기
        </button>

        <p className="text-gray-500 text-base text-center">
          버튼을 누르면 기기의 메일 앱이 열립니다
        </p>
      </main>
    </div>
  );
}
