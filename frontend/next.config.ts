import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/reservas",
        destination: "http://localhost:8081/reservar",
      },
    ];
  },
};

export default nextConfig;
