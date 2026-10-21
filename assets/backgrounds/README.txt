BACKGROUND VIDEOS  (one per page)
=================================
Put a video here named after the page and it becomes that page's background. Nothing else to change.

  news.mp4          -> News & Highlights page
  education.mp4     -> Education page
  skills.mp4        -> Skills page
  projects.mp4      -> Projects page
  certificates.mp4  -> Certificates page
  contact.mp4       -> Contact page

(.webm works too: news.webm ...). If a file is missing, that page simply has no background video.
Home and About are skipped by default (they have their own hero). To give them one too, open data.json ->
"backgrounds" -> remove "home"/"about" from "skip" and add the file, e.g.  "pages": { "about": "assets/backgrounds/about.mp4" }.

Tips: 10-20 seconds, loops, no sound needed (it is muted), 1280x720 or smaller, under ~5 MB.
Darkness / blur:  data.json -> "backgrounds" -> "overlay" (0 = clear video, 1 = black) and "blur" (pixels).

Phones (optional): a tall clip named  news-mobile.mp4 / skills-mobile.mp4 ...  is used on small screens instead (falls back to the normal file).
