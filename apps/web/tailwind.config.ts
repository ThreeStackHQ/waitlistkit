import type { Config } from "tailwindcss";
export default { darkMode:"class", content:["./src/**/*.{ts,tsx}"], theme:{ extend:{ colors:{ primary:{ DEFAULT:"#8b5cf6", foreground:"#fff" } } } }, plugins:[] } satisfies Config;
