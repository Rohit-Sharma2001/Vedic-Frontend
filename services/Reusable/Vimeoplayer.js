// services/Reusable/Vimeoplayer.js
import Player from "@vimeo/player";
import { useEffect, useRef, useState } from "react";

const VimeoPreview = ({
  videoId,
  previewTime = 0,
  controls,
  onPreviewEnd,
  onStop,
}) => {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);
  const [timeLeft, setTimeLeft] = useState(previewTime);
const [previewEnded, setPreviewEnded] = useState(false);

useEffect(() => {
  setTimeLeft(previewTime);
  setPreviewEnded(false);
}, [videoId, previewTime]);
  const handleReplayPreview = async () => {
  const p = playerInstance.current;
  if (!p) return;

  setPreviewEnded(false);
  setTimeLeft(previewTime);

  await p.setCurrentTime(0).catch(() => {});
  await p.play().catch(() => {});
};
  useEffect(() => {
    if (!videoId || !playerRef.current) return;

    // Clean previous instance if videoId changes fast
    if (playerInstance.current) {
      playerInstance.current.pause().catch(() => {});
      playerInstance.current.destroy().catch(() => {});
      playerInstance.current = null;
    }

    const player = new Player(playerRef.current, {
      url: videoId,
      controls,
      autoplay: true,
      muted: false,
      responsive: true,
    });

    playerInstance.current = player;

    if (previewTime > 0) {
      const onTimeUpdate = (data) => {
        const remaining = Math.max(previewTime - Math.floor(data.seconds), 0);
        setTimeLeft(remaining);

     if (data.seconds >= previewTime) {
  player.pause().catch(() => {});
  setPreviewEnded(true);
  onPreviewEnd?.();
}

      };
    


      player.on("timeupdate", onTimeUpdate);

      return () => {
        player.off("timeupdate", onTimeUpdate);
        player.pause().catch(() => {});
        player.destroy().catch(() => {});
      };
    }

    return () => {
      player.pause().catch(() => {});
      player.destroy().catch(() => {});
    };
  }, [videoId, previewTime, controls, onPreviewEnd]);

  useEffect(() => {
    if (onStop) onStop(() => playerInstance.current?.pause?.());
  }, [onStop]);

  return (
    <>
      <div className="vimeoWrap mt-5">
        <div ref={playerRef} className="vimeoStage" />

        {previewTime > 0 && (
          <div className="vimeoPreviewBadge">Preview ({timeLeft}s left)</div>
        )}

        {previewTime > 0 && previewEnded && (
  <button
    type="button"
    className="vimeoReplayBtn"
    onClick={handleReplayPreview}
  >
    Replay preview
  </button>
)}

      </div>

      {/* Component-scoped styles (no external CSS needed) */}
      <style jsx>{`
        .vimeoWrap {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 */
          overflow: hidden;
          border-radius: 8px; /* optional */
        }

        .vimeoStage {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }

        /* Vimeo injects an iframe inside vimeoStage */
        .vimeoStage :global(iframe) {
          width: 100% !important;
          height: 100% !important;
          display: block;
        }
        .vimeoReplayBtn {
  position: absolute;
  inset: 0;
  margin: auto;
  width: fit-content;
  height: fit-content;
  z-index: 6;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  border: 0;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 14px;
  cursor: pointer;
}


        .vimeoPreviewBadge {
          position: absolute;
          left: 12px;
          bottom: 12px;
          z-index: 5;
          background: rgba(0, 0, 0, 0.7);
          color: #fff;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 14px;
          line-height: 1;
          pointer-events: none;
        }
      `}</style>
    </>
  );
};

export default VimeoPreview;
