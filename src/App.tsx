import { useState, useEffect } from 'react';
import StainPage from './pages/StainPage';
import TeethPage from './pages/TeethPage';
import ContactPage from './pages/ContactPage';

type View = 'home' | 'stain-detect' | 'stain-classify' | 'teeth' | 'contact';

const HOME_BUTTONS: { view: View; label: string; description: string; color: string }[] = [
  {
    view: 'stain-detect',
    label: '의류 얼룩 탐지',
    description: '옷에 얼룩이 있는 위치를 찾아드립니다',
    color: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-400',
  },
  {
    view: 'stain-classify',
    label: '의류 얼룩 분류',
    description: '얼룩의 종류를 알려드립니다 (음료 / 음식 / 펜)',
    color: 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-400',
  },
  {
    view: 'teeth',
    label: '치아 이물질 탐지',
    description: '치아에 낀 이물질을 찾아드립니다',
    color: 'bg-teal-600 hover:bg-teal-700 focus:ring-teal-400',
  },
  {
    view: 'contact',
    label: '개발자에게 메일 쓰기',
    description: '새로운 기능이나 불편함을 알려주세요',
    color: 'bg-gray-700 hover:bg-gray-800 focus:ring-gray-500',
  },
];

export default function App() {
  const [view, setView] = useState<View>('home');

  const navigate = (target: View) => {
    if (target === 'home') {
      history.back();
    } else {
      history.pushState({ view: target }, '');
      setView(target);
    }
  };

  const goHome = () => navigate('home');

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      setView((e.state?.view as View) ?? 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (view === 'stain-detect') return <StainPage mode="detect" onBack={goHome} />;
  if (view === 'stain-classify') return <StainPage mode="classify" onBack={goHome} />;
  if (view === 'teeth') return <TeethPage onBack={goHome} />;
  if (view === 'contact') return <ContactPage onBack={goHome} />;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-100 px-6 md:px-10 py-12 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <img src="/microlens_logo.svg" alt="Microlens" className="h-[84px] w-auto object-contain" />
          <p className="text-xl text-slate-700 font-semibold hidden sm:block break-keep text-right">일상의 사소한 불편을 해결해주는 시력보조 파트너</p>
        </div>
      </header>

      <main className="flex-1 flex flex-col gap-4 px-6 pb-10">
        {HOME_BUTTONS.map(({ view: target, label, description, color }) => (
          <button
            key={target}
            onClick={() => navigate(target)}
            aria-label={`${label}. ${description}`}
            className={`
              w-full flex-1 min-h-[110px] rounded-2xl text-white text-left px-7
              flex flex-col justify-center gap-1
              transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-offset-white
              ${color}
            `}
          >
            <span className="text-2xl font-bold leading-tight">{label}</span>
            <span className="text-base text-white/70">{description}</span>
          </button>
        ))}
      </main>
    </div>
  );
}
