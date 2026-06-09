import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "도파밈",
    short_name: "도파밈",
    description: "게임처럼 즐기는 실세계 이벤트 예측 플랫폼",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#2563EB",
    orientation: "portrait",
    lang: "ko-KR",
    categories: ["games", "social", "sports", "finance"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "예측 시장",
        short_name: "마켓",
        description: "진행 중인 예측 시장 보기",
        url: "/markets",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
      {
        name: "내 활동",
        short_name: "활동",
        description: "내 예측과 DPMM 활동 보기",
        url: "/app",
        icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
      },
    ],
  };
}
