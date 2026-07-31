tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        serif: ['ui-serif', "Georgia", '"Times New Roman"', '"DejaVu Serif"', "Times", "serif"],
        ananda: ['"Ananda Black"', "cursive"],
      },
      colors: {
        nomad: {
          paper: "#F4F1EA",
          ink: "#333344",
          sea: "#6B7B91",
          ice: "#A9C6E0",
          peach: "#F7E3E1",
          dusk: "#E8D1D1",
          mist: "#B0C4DE",
          sage: "#7A9E7E",
          mint: "#A8C69F",
          cream: "#F5F5F5",
          deep: "#4A4E69",
        },
      },
      backgroundImage: {
        "noise-grain":
          'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
      },
      keyframes: {
        deckBounceMobile: {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "20%": { transform: "translateY(-12px)" },
          "40%": { transform: "translateY(-5px)" },
        },
        loaderPulse: {
          "0%, 100%": { opacity: "0.55", transform: "scale(0.98)" },
          "50%": { opacity: "1", transform: "scale(1.02)" },
        },
      },
      animation: {
        "deck-bounce-mobile": "deckBounceMobile 1.2s ease-in-out",
        "loader-pulse": "loaderPulse 1.1s ease-in-out infinite",
      },
    },
  },
  safelist: [
    "opacity-0",
    "opacity-100",
    "transition-none",
    "transition-opacity",
    "duration-300",
    "ease-out",
    "transition-[transform,opacity]",
    "duration-[560ms]",
    "ease-[cubic-bezier(0.2,0.82,0.28,1)]",
    "transition-transform",
    "duration-[450ms]",
    "ease-[cubic-bezier(0.34,1.02,0.52,1)]",
    "duration-[360ms]",
    "transition-[left,top,width,height]",
    "duration-[540ms]",
    "ease-[cubic-bezier(0.22,0.91,0.36,1)]",
    "left-[var(--card-fly-x)]",
    "top-[var(--card-fly-y)]",
    "w-[var(--card-fly-w)]",
    "h-[var(--card-fly-h)]",
  ],
  plugins: [
    function ({ addComponents }) {
      const tarotPhotoBase = {
        content: '""',
        position: "absolute",
        left: "50%",
        top: "50%",
        width: "100vh",
        height: "100vw",
        transform: "translate(-50%, -50%) rotate(90deg)",
        backgroundImage: 'url("./assets/background.jpg")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        pointerEvents: "none",
      };
      const tarotOverlayBase = {
        content: '""',
        position: "absolute",
        inset: "0",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        pointerEvents: "none",
      };
      addComponents({
        ".bg-tarot-sky": {
          position: "relative",
          isolation: "isolate",
          "&::before": {
            ...tarotPhotoBase,
            zIndex: -2,
            backgroundPosition: "center",
          },
        },
        ".bg-tarot-spread": {
          position: "relative",
          isolation: "isolate",
          "&::before": {
            ...tarotPhotoBase,
            zIndex: -2,
            backgroundPosition: "center bottom",
          },
          "&::after": {
            ...tarotOverlayBase,
            zIndex: -1,
            background: "rgba(0, 0, 0, 0.4)",
          },
        },
      });
    },
  ],
};
