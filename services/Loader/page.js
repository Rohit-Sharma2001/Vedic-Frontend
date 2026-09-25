import { useState } from "react";

function Loader() {
  let [loading, setLoading] = useState(true);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backdropFilter: "blur(1px)",
        // backgroundColor: "rgba(255,255,255,0.6)", // optional: white overlay
        zIndex: 2000, // 🚀 higher than Bootstrap modal (1055)
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
      }}
    >
      <lottie-player
        src="/images/yoga.json"
        loop
        autoplay
        style={{
          width: "170px",
          height: "170px",
        }}
      ></lottie-player>
    </div>
  );
}

export default Loader;
