import gsap from "gsap";
import { useGSAP } from "@gsap/react";

// Register GSAP plugins once at module initialization
if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export { gsap, useGSAP };

