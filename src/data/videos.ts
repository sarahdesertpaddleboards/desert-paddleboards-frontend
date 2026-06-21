/**
 * Homepage videos — YouTube clips for the "See it in action" section.
 * Editable via the CMS (Pages CMS — see `.pages.yml`). `id` is the YouTube
 * video id (the part after `watch?v=`).
 */
import data from "./videos.json";

export interface Video {
  id: string;
  title: string;
}

export const videos: Video[] = data.videos as Video[];
