import { useCallback, useEffect, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface VideoPlayerProps {
  title: string;
  youtubeId: string;
  onClose?: () => void;
}

export function VideoPlayer({ title, youtubeId, onClose }: VideoPlayerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const playerIdRef = useRef(`yt-player-${youtubeId}-${Math.random().toString(36).slice(2)}`);
  const hasPushedHistoryRef = useRef(false);

  /** ------------ Fullscreen helpers ------------ */
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
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      // webkitExitFullscreen/msExitFullscreen 很舊了，通常不需要
    } catch (e) {
      console.warn("exitFullscreen failed:", e);
    }
  }, []);

  /** ------------ Back(Home) 邏輯 ------------ */
  const goHome = useCallback(async () => {
    await exitFs();
    onClose?.();
  }, [exitFs, onClose]);

  /** ------------ 初始化 YT Player ------------ */
  const initPlayer = useCallback(() => {
    if (!window.YT?.Player) return;

    playerRef.current = new window.YT.Player(playerIdRef.current, {
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
          // 自動全螢幕 + 自動播放
          await requestFs();
          try {
            e.target.playVideo();
          } catch (err) {
            console.warn("playVideo failed:", err);
          }
          // 讓遙控器操作能集中在 wrapper 上（你也可以改讓 iframe 聚焦）
          wrapperRef.current?.focus();
        },
        onStateChange: async (e: any) => {
          // 影片結束自動退出全螢幕 & 回首頁
          if (e.data === window.YT.PlayerState.ENDED) {
            await goHome();
          }
        },
      },
    });
  }, [youtubeId, requestFs, goHome]);

  /** ------------ 載入 YT IFrame API  ------------ */
  useEffect(() => {
    const haveYT = !!window.YT?.Player;
    if (haveYT) {
      initPlayer();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(script);

    window.onYouTubeIframeAPIReady = () => {
      initPlayer();
    };

    return () => {
      // 清掉全域 callback（避免重複初始化）
      if (window.onYouTubeIframeAPIReady) {
        // @ts-ignore
        delete window.onYouTubeIframeAPIReady;
      }
    };
  }, [initPlayer]);

  /** ------------ 監聽鍵盤事件（遙控器 Enter / Play/Pause / Back / Escape） ------------ */
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      const code: any = (e as any).keyCode;

      // DPAD_CENTER(23) or Enter → 如果暫停就播放，播放就全螢幕
      if (e.key === "Enter" || code === 23) {
        if (playerRef.current) {
          const state = playerRef.current.getPlayerState?.();
          if (state === window.YT?.PlayerState?.PLAYING) {
            await requestFs(); // 再次確保全螢幕
          } else {
            playerRef.current.playVideo?.();
            await requestFs();
          }
        }
      }

      // Space(32) / 媒體鍵(179) → 播放 / 暫停切換
      if (e.key === " " || code === 179) {
        e.preventDefault();
        if (playerRef.current) {
          const state = playerRef.current.getPlayerState?.();
          if (state === window.YT?.PlayerState?.PLAYING) {
            playerRef.current.pauseVideo?.();
          } else {
            playerRef.current.playVideo?.();
          }
        }
      }

      // Escape / Back (Android TV 可能攔不到，但試著處理)
      if (e.key === "Escape" || code === 4) {
        e.preventDefault();
        await goHome();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goHome, requestFs]);

  /** ------------ popstate（處理遙控器/瀏覽器返回鍵） ------------ */
  useEffect(() => {
    if (!hasPushedHistoryRef.current) {
      // push 一個新的 state，讓 Back 會先回到這裡
      history.pushState({ player: true }, "");
      hasPushedHistoryRef.current = true;
    }

    const onPop = async (e: PopStateEvent) => {
      await goHome();
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [goHome]);

  /** ------------ fullscreen 變化（可選：離開全螢幕時自動暫停或關閉） ------------ */
  useEffect(() => {
    const onFsChange = async () => {
      if (!document.fullscreenElement) {
        // 你可以選擇只是暫停，不一定要 goHome
        // playerRef.current?.pauseVideo?.();
        // 或自動回首頁：
        // await goHome();
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [goHome]);

  /** ------------ unmount 清理 ------------ */
  useEffect(() => {
    return () => {
      try {
        playerRef.current?.destroy?.();
      } catch {}
    };
  }, []);

  return (
    <div ref={wrapperRef} tabIndex={0} className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-purple-300 outline-none">
      {/* Header */}
      <div className="flex justify-between items-start p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {onClose && (
          <button onClick={goHome} className="bg-black/50 hover:bg黑/70 text-white rounded-full w-10 h-10 flex items-center justify-center text-2xl" aria-label="Close">
            ×
          </button>
        )}
      </div>

      {/* YouTube Player 容器（IFrame API 會塞進來） */}
      <div className="w-full aspect-video bg-black">
        <div id={playerIdRef.current} className="w-full h-full" />
      </div>
    </div>
  );
}
