"use client";

import { createContext, useContext } from "react";
import { type FeaturedVideo } from "@/data/videos";

type VideoClickHandler = (video: FeaturedVideo) => void;

export const VideoClickContext = createContext<VideoClickHandler | null>(null);

export function useVideoClick(): VideoClickHandler | null {
  return useContext(VideoClickContext);
}
