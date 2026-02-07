import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["assets/icons/icon-192.png", "assets/icons/icon-512.png"],
      manifest: {
        name: "Eco-Löwe Winterthur",
        short_name: "Eco-Löwe",
        description: "Nachhaltige Mobilität gamified – zu Fuß & ÖV statt Auto.",
        theme_color: "#D61F2C",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/assets/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/assets/icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  server: {
    host: true,
    allowedHosts: true
  },
  preview: {
    host: true,
    allowedHosts: true
  }
});
