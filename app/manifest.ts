import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Casa 300", short_name: "Casa 300", description: "Orcamento para finalizacao da nova casa.", start_url: "/", display: "standalone", background_color: "#f7f8f4", theme_color: "#0d5549", icons: [{ src: "/icon", sizes: "any", type: "image/png" }] };
}