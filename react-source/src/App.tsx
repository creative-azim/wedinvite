import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Navigation, Volume2, VolumeX } from "lucide-react";
import { WEDDING_CONFIG } from "./config/weddingConfig";

export const FloralDivider = () => (
  <div className="my-3 flex items-center justify-center gap-3">
    <span className="h-px w-16 bg-gold-soft" />
    <span className="text-gold text-lg">❀</span>
    <span className="h-px w-16 bg-gold-soft" />
  </div>
);

export const BotanicalAccents = () => (
  <>
    <span className="pointer-events-none absolute top-6 left-4 text-4xl opacity-20">🌿</span>
    <span className="pointer-events-none absolute top-12 right-6 text-3xl opacity-20">🌸</span>
    <span className="pointer-events-none absolute bottom-10 left-10 text-3xl opacity-20">🌼</span>
    <span className="pointer-events-none absolute bottom-6 right-4 text-4xl opacity-20">🌿</span>
  </>
);

export const FloatingPetals: React.FC<{ count?: number }> = ({ count = 32 }) => {
  const gradients = [
    "linear-gradient(135deg, #fce7f3, #f472b6)",
    "linear-gradient(135deg, #fbcfe8, #fb7185)",
    "linear-gradient(135deg, #ffe4e6, #f472b6)",
    "linear-gradient(135deg, #fdf2f8, #f9a8d4)",
    "linear-gradient(135deg, #fecdd3, #fda4af)",
    "linear-gradient(135deg, #fff1f2, #f472b6)",
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-10 overflow-hidden">
      {Array.from({ length: count }).map((_, n) => {
        const left = Math.random() * 100;
        const duration = 13 + Math.random() * 15;
        const delay = Math.random() * 10;
        const width = 3 + Math.random() * 3.5;
        const height = width * (1.15 + Math.random() * 0.35);
        const opacity = 0.5 + Math.random() * 0.35;
        const bg = gradients[n % gradients.length];
        const borderRadius = n % 2 === 0 ? "150% 0 150% 50%" : "50% 150% 50% 150%";
        return (
          <span
            key={n}
            className="absolute animate-float-petal"
            style={{
              left: `${left}%`,
              top: "-10vh",
              width: `${width}px`,
              height: `${height}px`,
              background: bg,
              opacity,
              borderRadius,
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              boxShadow: "0 1px 2px rgba(244, 114, 182, 0.25)",
            }}
          />
        );
      })}
    </div>
  );
};

export const AudioPlayer: React.FC<{ play: boolean; src?: string }> = ({
  play,
  src = "audio/background.mp3",
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = WEDDING_CONFIG.audio.volume;
    el.loop = true;
    if (play && !muted) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  }, [play, muted]);

  return (
    <>
      <audio ref={audioRef} src={src} preload="auto" />
      {play && (
        <button
          type="button"
          aria-label={muted ? "Unmute background music" : "Mute background music"}
          onClick={() => setMuted((m) => !m)}
          className="fixed bottom-5 right-5 z-50 h-11 w-11 rounded-full bg-foreground/80 text-cream backdrop-blur shadow-elegant flex items-center justify-center hover:scale-105 transition"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      )}
    </>
  );
};

export const IntroOverlay: React.FC<{ onOpen: () => void; onStartPlay: () => void }> = ({
  onOpen,
  onStartPlay,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const dismissedRef = useRef(false);

  const triggerDismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    setFadingOut(true);
    window.setTimeout(onOpen, WEDDING_CONFIG.introOverlay.fadeDurationMs);
  };

  const handleTap = () => {
    if (!videoRef.current || started) return;
    videoRef.current.currentTime = 0;
    videoRef.current
      .play()
      .then(() => {
        setStarted(true);
        onStartPlay();
      })
      .catch((err) => console.error("Play failed:", err));
  };

  return (
    <div
      onClick={handleTap}
      className="fixed inset-0 w-full h-full bg-black flex items-center justify-center cursor-pointer overflow-hidden z-50 select-none"
      style={{
        opacity: fadingOut ? 0 : 1,
        transition: `opacity ${WEDDING_CONFIG.introOverlay.fadeDurationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        pointerEvents: fadingOut ? "none" : undefined,
      }}
    >
      <video
        ref={videoRef}
        src={`${WEDDING_CONFIG.introOverlay.videoSrc}#t=0.1`}
        className="w-full h-full object-cover"
        playsInline
        muted
        onTimeUpdate={() => {
          if (
            videoRef.current &&
            videoRef.current.currentTime >= WEDDING_CONFIG.introOverlay.fadeTriggerSeconds
          ) {
            triggerDismiss();
          }
        }}
        onEnded={triggerDismiss}
        preload="auto"
      />
      {!started && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-end pb-20 sm:pb-24 pointer-events-none animate-fade-in">
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-[#d4af37] via-[#fcf6ba] to-[#aa771c] opacity-80 blur-md animate-pulse" />
              <div className="relative px-7 py-3.5 rounded-full bg-[#1a0c10]/90 border-2 border-[#e5c158] text-[#fbf5b7] shadow-2xl backdrop-blur-md flex items-center gap-3 transition-transform duration-300">
                <Sparkles className="w-4 h-4 text-[#e5c158] animate-pulse" />
                <span className="font-cinzel text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-white drop-shadow-md">
                  {WEDDING_CONFIG.introOverlay.buttonText}
                </span>
                <Sparkles className="w-4 h-4 text-[#e5c158] animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ScratchCard: React.FC<{ revealed: boolean; onRevealed: () => void }> = ({
  revealed,
  onRevealed,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDrawingRef = useRef(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = WEDDING_CONFIG.scratchAndCountdown.scratchFoilSrc;

    const setup = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container || done) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.fillStyle = WEDDING_CONFIG.scratchAndCountdown.foilBaseColor;
      ctx.fillRect(0, 0, rect.width, rect.height);
      if (img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      } else {
        img.onload = () => {
          if (!canvasRef.current || done) return;
          const c = canvasRef.current.getContext("2d");
          if (c) c.drawImage(img, 0, 0, rect.width, rect.height);
        };
      }
    };

    setup();
    window.addEventListener("resize", setup);
    return () => window.removeEventListener("resize", setup);
  }, [done]);

  const fireCelebration = () => {
    const burst = (origin: { x: number; y: number }) =>
      confetti({
        particleCount: 120,
        spread: 90,
        startVelocity: 45,
        origin,
        colors: WEDDING_CONFIG.scratchAndCountdown.confettiColors,
        scalar: 1.1,
      });
    burst({ x: 0.2, y: 0.4 });
    burst({ x: 0.5, y: 0.3 });
    burst({ x: 0.8, y: 0.4 });
    setTimeout(() => burst({ x: 0.5, y: 0.5 }), 250);
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas || done) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let cleared = 0;
    for (let i = 3; i < data.length; i += 160) {
      if (data[i] < 60) cleared++;
    }
    const total = data.length / 160;
    if (cleared / total > WEDDING_CONFIG.scratchAndCountdown.revealThreshold) {
      setDone(true);
      ctx.clearRect(0, 0, width, height);
      fireCelebration();
      onRevealed();
    }
  };

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || done) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(clientX - rect.left, clientY - rect.top, 26, 0, Math.PI * 2);
    ctx.fill();
  };

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-[340px] sm:max-w-md aspect-[1.875/1] rounded-2xl overflow-hidden border border-[#c5a880]/60 shadow-xl select-none"
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-[#fffdfa] to-[#fbf2df] p-4 text-center border-2 border-[#c5a880]/40 rounded-2xl shadow-inner">
        <p className="font-cinzel tracking-[0.35em] text-[#800020] text-xs sm:text-sm font-bold uppercase">
          {WEDDING_CONFIG.scratchAndCountdown.saveTheDateLabel}
        </p>
        <p className="font-dm-serif text-2xl sm:text-4xl text-[#800020] mt-1.5 tracking-wide drop-shadow-xs">
          {WEDDING_CONFIG.scratchAndCountdown.weddingDateDisplay}
        </p>
      </div>
      {!revealed && (
        <canvas
          ref={canvasRef}
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
            isDrawingRef.current = true;
            scratch(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (isDrawingRef.current) {
              e.preventDefault();
              scratch(e.clientX, e.clientY);
            }
          }}
          onPointerUp={() => {
            isDrawingRef.current = false;
            checkProgress();
          }}
          onPointerLeave={() => {
            isDrawingRef.current = false;
            checkProgress();
          }}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none z-10 rounded-2xl"
        />
      )}
    </div>
  );
};

export default function App() {
  const [opened, setOpened] = useState(false);
  const [audioPlay, setAudioPlay] = useState(false);
  const [scratched, setScratched] = useState(false);

  return (
    <div className="md:fixed md:inset-0 md:w-screen md:h-screen md:overflow-hidden md:flex md:items-center md:justify-center md:bg-[#f2ece3]">
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
        <img
          src={WEDDING_CONFIG.familyIntro.backgroundSrc}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover scale-105 blur-[8px] opacity-95 brightness-98 saturate-105"
        />
        <div className="absolute inset-0 bg-white/5" />
      </div>
      <div className="relative z-10 w-full md:max-w-[440px] md:h-screen md:shadow-[0_0_50px_rgba(0,0,0,0.35)] md:border-x md:border-[#c5a880]/40 overflow-hidden bg-[#faf6f0]">
        <div className="phone-viewport w-full min-h-screen md:min-h-0 md:h-screen md:overflow-y-auto md:overflow-x-hidden relative">
          <div className="relative min-h-screen">
            <FloatingPetals count={WEDDING_CONFIG.petals.count} />
            <AudioPlayer play={audioPlay || opened} src={WEDDING_CONFIG.audio.src} />
            {!opened && (
              <IntroOverlay
                onOpen={() => setOpened(true)}
                onStartPlay={() => setAudioPlay(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
