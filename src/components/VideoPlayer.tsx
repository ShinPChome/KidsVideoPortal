import { useCallback, useEffect, useRef } from "react";

type VideoPlayerProps = {
  youtubeId: string;
  title: string;
  onClose: () => void;
};

export default function VideoPlayer({ youtubeId, title, onClose }: VideoPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null); // fullscreen target
  const hostRef = useRef<HTMLDivElement>(null); // YT will render iframe into this
  const playerRef = useRef<any>(null);
  const hasPushedHistoryRef = useRef(false);

  // ----- Fullscreen helpers -----
  const requestFs = useCallback(async () => {
    const el: any = wrapperRef.current;
    if (!el) return;
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) await el.msRequestFullscreen();
    } catch (e) {
      console.warn("requestFullscreen failed:", e);
    }
  }, []);

  const exitFs = useCallback(async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      // Safari old: (document as any).webkitExitFullscreen?.();
    } catch (e) {
      console.warn("exitFullscreen failed:", e);
    }
  }, []);

  const goHome = useCallback(async () => {
    try {
      // 先停止影片播放
      playerRef.current?.stopVideo?.();
      // 等待退出全螢幕
      await exitFs();
      // 最後觸發關閉事件
      onClose();
    } catch (e) {
      console.warn("Error in goHome:", e);
      onClose(); // 確保即使出錯也會關閉
    }
  }, [exitFs, onClose]);

  // ----- Initialize YouTube IFrame Player -----
  useEffect(() => {
    function init() {
      if (!hostRef.current || !window.YT?.Player) return;
      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          playsinline: 1,
          rel: 0,
          fs: 1,
        },
        events: {
          onReady: async (e: any) => {
            // Ensure iframe allows autoplay/fullscreen
            try {
              const iframe: HTMLIFrameElement | undefined = playerRef.current?.getIframe?.();
              iframe?.setAttribute("allow", "autoplay; fullscreen; picture-in-picture; encrypted-media");
            } catch {}

            // Try to autoplay and fullscreen
            try {
              e.target.playVideo();
            } catch (err) {
              console.warn("playVideo failed:", err);
            }
            await requestFs();

            // Focus wrapper so it receives remote key events
            wrapperRef.current?.focus();
          },
          onStateChange: async (e: any) => {
            if (e.data === window.YT.PlayerState.ENDED) {
              await goHome();
            }
          },
        },
      });
    }

    if (window.YT && window.YT.Player) {
      init();
    } else {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const first = document.getElementsByTagName("script")[0];
      first?.parentNode?.insertBefore(tag, first);
      (window as any).onYouTubeIframeAPIReady = () => init();
    }

    return () => {
      try {
        playerRef.current?.destroy?.();
      } catch {}
    };
  }, [youtubeId, requestFs, goHome]);

  // ----- Keyboard / remote controls -----
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      const code: any = (e as any).keyCode;

      // Enter / DPAD_CENTER → ensure fullscreen and play
      if (e.key === "Enter" || code === 23) {
        try {
          const st = playerRef.current?.getPlayerState?.();
          if (st !== window.YT?.PlayerState?.PLAYING) playerRef.current?.playVideo?.();
        } catch {}
        await requestFs();
      }

      // Space(32) / MediaPlayPause(179) → toggle play/pause
      if (e.key === " " || code === 179) {
        e.preventDefault();
        try {
          const st = playerRef.current?.getPlayerState?.();
          if (st === window.YT?.PlayerState?.PLAYING) playerRef.current?.pauseVideo?.();
          else playerRef.current?.playVideo?.();
        } catch {}
      }

      // Escape / Android Back(4) → close
      if (e.key === "Escape" || code === 4) {
        e.preventDefault();
        await goHome();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goHome, requestFs]);

  // ----- History back handling (TV Back key often triggers back navigation) -----
  useEffect(() => {
    if (!hasPushedHistoryRef.current) {
      history.pushState({ player: true }, "");
      hasPushedHistoryRef.current = true;
    }
    const onPop = async () => {
      await goHome();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [goHome]);

  return (
    <div ref={wrapperRef} tabIndex={0} className="video-player outline-none">
      <div ref={hostRef} className="w-full aspect-video bg-black" />
      <button onClick={goHome} aria-label={`Close ${title} video`} className="close-button">
        Close
      </button>
    </div>
  );
}
