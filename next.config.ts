import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Old Squarespace blog URLs
      { source: "/lo-mas-importante-de-una-boda/:path*", destination: "/blog-de-novedades", permanent: true },
      { source: "/blog-de-novedades/blog-post-title-one-j3n87", destination: "/blog-de-novedades/lo-mas-importante-de-una-boda", permanent: true },
      { source: "/blog-de-novedades/blog-post-title-two-awgyd", destination: "/blog-de-novedades/el-mejor-sitio-para-tu-boda", permanent: true },
      { source: "/blog-de-novedades/blog-post-title-three-t7ct8", destination: "/blog-de-novedades/tecnologia-en-bodas-y-eventos", permanent: true },
      { source: "/blog-de-novedades/blog-post-title-four-wca7a", destination: "/blog-de-novedades/bodas-tematicas", permanent: true },
      { source: "/cart", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
