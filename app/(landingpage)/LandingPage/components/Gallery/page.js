// app/Gallery/page.jsx
"use client";
import React, { useEffect, useState } from "react";
import Header from "../Header/page";
import Link from "next/link";
import { postApi } from "services/api";
import { config, checkIsOwner } from "services/config";
import { usePathname } from "next/navigation";
import "bootstrap/dist/css/bootstrap.min.css";
import '../../../LandingPage/public/css/style.css'
import { createPortal } from "react-dom";

const GalleryPage = () => {
  const [items, setItems] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingAll, setLoadingAll] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(60); // larger page size for galleries
  const pathname = usePathname();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
const [videoItems, setVideoItems] = useState([]);
const [loadingVideos, setLoadingVideos] = useState(true);
const [loadingAllVideos, setLoadingAllVideos] = useState(false);

// optional modal playback (recommended)
const [showVideoModal, setShowVideoModal] = useState(false);
const [activeVideoSrc, setActiveVideoSrc] = useState("");
const [activeVideoTitle, setActiveVideoTitle] = useState("");
const [pageTitle, setPageTitle] = useState("Gallery");
const [pageSubtitle, setPageSubtitle] = useState("Recent glimpses from our sessions");
const [pagevideoTitle, setPageVideoTitle] = useState("Gallery ( Videos )");
const [pagevideoSubtitle, setPageVideoSubTitle] = useState("Watch our latest clips");

const fetchGalleryHeader = async () => {
 
  try {
    const endpoint = config.GetBalancingDiet; // same as BeginYourJourney.tsx
    const payload = { type: "kapha" };
    const response = await postApi(endpoint, payload);

    const title = response?.data?.data?.[0]?.gallery_image_title;
    const subtitle = response?.data?.data?.[0]?.gallery_image_subtitle;
    const videotitle = response?.data?.data?.[0]?.gallery_video_title;
    const videosubtitle = response?.data?.data?.[0]?.gallery_video_subtitle;

    setPageTitle(title || "Images From Gallery");
    setPageSubtitle(subtitle || "Images From Gallery"); 
    setPageVideoTitle(videotitle || "Images From Gallery");
    setPageVideoSubTitle(videosubtitle || "Images From Gallery");
  } catch (error) {
    console.error("Error fetching gallery header:", error);
  } finally {
    
  }
};

useEffect(() => {
  fetchGalleryHeader();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

const fetchVideoPage = async (page) => {
  const endpoint = config.category;
  const data = { dropdown_type: "gallery_videos", page, pageSize };
  const response = await postApi(endpoint, data);
  return {
    list: Array.isArray(response?.result) ? response.result : [],
    totalPages: Number(response?.totalPages) || 1,
  };
};

useEffect(() => {
  let cancelled = false;

  const loadAllVideos = async () => {
    setLoadingVideos(true);
    try {
      const first = await fetchVideoPage(1);
      if (cancelled) return;

      setVideoItems(first.list);

      if (first.totalPages > 1) {
        setLoadingAllVideos(true);
        const maxPages = Math.min(first.totalPages, 25);
        for (let p = 2; p <= maxPages; p += 1) {
          const next = await fetchVideoPage(p);
          if (cancelled) return;
          setVideoItems((prev) => prev.concat(next.list));
        }
      }
    } catch (e) {
      console.error("Error fetching gallery videos:", e);
      setVideoItems([]);
    } finally {
      if (!cancelled) {
        setLoadingVideos(false);
        setLoadingAllVideos(false);
      }
    }
  };

  loadAllVideos();
  return () => {
    cancelled = true;
  };
}, [pageSize]);

useEffect(() => {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);

  const fetchPage = async (page) => {
    const endpoint = config.category;
    const data = { dropdown_type: "gallery_images", page, pageSize };
    const response = await postApi(endpoint, data);
    return {
      list: Array.isArray(response?.result) ? response.result : [],
      totalPages: Number(response?.totalPages) || 1,
    };
  };

  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      setLoading(true);
      try {
        // First page (to know totalPages)
        const first = await fetchPage(1);
        if (cancelled) return;

        setItems(first.list);
        setTotalPages(first.totalPages);

        // Load remaining pages and append
        if (first.totalPages > 1) {
          setLoadingAll(true);
          // safety cap: avoid accidental infinite loops / huge payloads
          const maxPages = Math.min(first.totalPages, 25);
          for (let p = 2; p <= maxPages; p += 1) {
            const next = await fetchPage(p);
            if (cancelled) return;
            setItems((prev) => prev.concat(next.list));
          }
        }
      } catch (e) {
        console.error("Error fetching gallery images:", e);
        setItems([]);
        setTotalPages(1);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingAll(false);
        }
      }
    };

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [pageSize]);

  return (
    <>
      {!isOwner ? (
        <Header
          arrayheader={[
            { name: "Home", route: "/" },
    { name: "Book Online", route: "/Appointment/components/BookAppointment" },
    { name: "Order", route: "/profile?tab=orders" },
    { name: "Yoga ", route: "/YogaClasses/components/JoinYogaClasses" },
    { name: "Event", route: "/Events" },
    {
    name: "Resources",
    route:"/LandingPage/components/Quiz",
    children: [
      { name: "Dosha Quiz", route: "/LandingPage/components/Quiz" },
      { name: "Health Articles", route: "/LandingPage/components/BookArticles" },
      { name: "Gallery", route: "/LandingPage/components/Gallery" },

    ]
  },
          ]}
        />
      ) : (
        <h3 className="mt-3" style={{ marginLeft: "15px" }}>
          Amita Jain Landing Page
        </h3>
      )}

      <section className="cc-gallerySection" style={{paddingTop:'90px'}}>
        <div className="cc-bgOrnament cc-bgOrnament--one" aria-hidden="true" />
        <div className="cc-bgOrnament cc-bgOrnament--two" aria-hidden="true" />
        <div className="cc-container">
          {isOwner && (
            <Link href="/admin/Master/GalleryImages" className="cc-manageBtn">
              Manage Gallery
            </Link>
          )}

              <div className="section-heading text-start ms-0 mw-100">
               
                <img src="/images/landingpage/watermark.png" width={50} />
                <h2>{pageTitle ? pageTitle : "Gallery"}</h2>
                <p>{pageSubtitle ? pageSubtitle : "Recent glimpses from our sessions"}</p>
              </div>

         

          {/* Masonry */}
          <div className="cc-grid" aria-live="polite">

            {items.length === 0 && !loading && (
              <div className="cc-empty">No images found.</div>
            )}

            {/* -------------------- Gallery (Videos) -------------------- */}



            {/* Skeletons while loading initial data */}
            {loading && (
              <>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={`sk-${i}`} className="cc-skel" />
                ))}
              </>
            )}

            {/* Images */}
            {items.map((item, idx) => {
              const key = item?.id ?? `${item?.file ?? "missing"}-${idx}`;
              const src = item?.file
                ? `${apiBase}/${item.file}`
                : "/images/placeholder.png";
              const alt = item?.alt || item?.title || "Gallery image";
              return (
                <Link href={src}  key={key}  target="blank">
                <figure  className="cc-card">
                
                  <img
                    className="cc-img"
                    src={src}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                  />
                  {(item?.title || item?.alt) && (
                    <figcaption className="cc-caption" title={alt}>
                      {alt}
                    </figcaption>
                  )}
                </figure>
                </Link>
              );
            })}

            
          </div>

          <div style={{ marginTop: 40 }}>
  {isOwner && (
    <Link href="/admin/Master/GalleryVideos" className="cc-manageBtn">
      Manage Gallery Videos
    </Link>
  )}

  <div className="section-heading text-start ms-0 mw-100">
    <img src="/images/landingpage/watermark.png" width={50} />
   
    <h2>{pagevideoTitle ? pagevideoTitle : "Gallery ( Videos )"}</h2>
                <p>{pagevideoSubtitle ? pagevideoSubtitle : "Watch our latest clips"}</p>
  </div>

  <div className="cc-grid" aria-live="polite">
    {videoItems.length === 0 && !loadingVideos && (
      <div className="cc-empty">No videos found.</div>
    )}

    {loadingVideos && (
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`vsk-${i}`} className="cc-skel" />
        ))}
      </>
    )}

    {videoItems.map((item, idx) => {
      const key = item?.id ?? `${item?.file ?? "missing"}-${idx}`;
      const src = item?.file ? `${apiBase}/${item.file}` : "";
      const title = item?.name || item?.title || "Gallery video";

      const isVideo =
        typeof item?.file === "string" &&
        /\.(mp4|mov|webm|m4v)$/i.test(item.file);

      if (!src) return null;

      return (
        <figure key={key} className="cc-card cc-videoCard">
          {isVideo ? (
            <>
              <video
                className="cc-img"
                src={src}
                muted
                loop
                playsInline
                preload="metadata"
              />
              <button
                type="button"
                className="cc-videoPlayBtn"
                onClick={() => {
                  setActiveVideoSrc(src);
                  setActiveVideoTitle(title);
                  setShowVideoModal(true);
                }}
                aria-label={`Play ${title}`}
              >
                <img
                  src="/images/landingpage/video-icon.svg"
                  alt=""
                  width={44}
                  height={44}
                />
              </button>
            </>
          ) : (
            // fallback if API ever returns image thumbs in gallery_videos
            <img className="cc-img" src={src} alt={title} loading="lazy" />
          )}

          <figcaption className="cc-caption" title={title}>
            {title}
          </figcaption>
        </figure>
      );
    })}
  </div>

  {loadingAllVideos && (
    <div className="cc-loadingMore" aria-live="polite">
      Loading more videos…
    </div>
  )}
</div>

          {/* Tiny status note while pulling the rest */}
          {loadingAll && (
            <div className="cc-loadingMore" aria-live="polite">
              Loading more images…
            </div>
          )}
        </div>
      </section>

 <VideoLightbox
  open={showVideoModal}
  src={activeVideoSrc}
  title={activeVideoTitle || "Gallery Video"}
  onClose={() => {
    setShowVideoModal(false);
    setActiveVideoSrc("");
    setActiveVideoTitle("");
  }}
/>

<style jsx global>{`
  .cc-modalOverlay {
    position: fixed;
    inset: 0;
    z-index: 99999;
    padding: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(10, 10, 10, 0.72);
    backdrop-filter: blur(6px);
  }

  .cc-modalPanel {
    width: min(1100px, 92vw);
    height: min(90vh, 720px);
    background: #ffffff;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
  }

  .cc-modalHeader {
    height: 56px;
    padding: 0 14px 0 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(0,0,0,0.08);
    background: linear-gradient(180deg, #fff 0%, #fafafa 100%);
  }

  .cc-modalTitle {
    font-size: 14px;
    font-weight: 700;
    color: #2b2b2b;
  }

  .cc-modalClose {
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 1px solid rgba(0,0,0,0.12);
    background: #fff;
    cursor: pointer;
    line-height: 1;
  }

  .cc-modalBody {
    flex: 1;
    padding: 14px;
    display: flex;
  }

  .cc-videoFrame {
    width: 100%;
    height: 100%;
    border-radius: 14px;
    overflow: hidden;
    background: #000;
  }
`}</style>




    <style jsx>{`
  /* ------ Layout Typography Improvements ------ */
.cc-modalOverlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(10, 10, 10, 0.72);
  backdrop-filter: blur(6px);
}

.cc-modalPanel {
  width: min(1100px, 92vw);
  height: min(90vh, 720px);
  background: #ffffff;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
}

.cc-modalHeader {
  height: 56px;
  padding: 0 14px 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid rgba(0,0,0,0.08);
  background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(250,250,250,1) 100%);
}

.cc-modalTitle {
  font-size: 14px;
  font-weight: 700;
  color: #2b2b2b;
}

.cc-modalClose {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
  cursor: pointer;
  line-height: 1;
}

.cc-modalClose:hover {
  opacity: 0.9;
}

.cc-modalBody {
  flex: 1;
  padding: 14px;
  display: flex;
}

.cc-videoFrame {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: #000;
}


  .cc-gallerySection {
    padding: 110px 0 70px;
    background: #F5FCFF;
  }

  .cc-bgOrnament {
    display: none;
  }

  .cc-container {
    width: min(1140px, 92vw);
    margin: 0 auto;
  }

  .cc-manageBtn {
    display: inline-flex;
    margin-left: auto;
    margin-bottom: 18px;
    padding: 8px 18px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: linear-gradient(120deg,#71318B,#df741e);
    transition: opacity .2s ease;
  }

  .cc-manageBtn:hover {
    color: #fff;
    opacity: .9;
  }

  /* ------ Heading Section ------ */
  .cc-headingSimple {
    max-width: 520px;
    margin: 0 auto 34px;
  }

  .cc-headingSimple h2 {
    font-size: clamp(24px, 3vw, 32px);
    color: #662A09;
    margin-bottom: 8px;
  }

  .cc-headingSimple p {
    font-size: 15px;
    color: #4a372b;
  }

  .cc-videoCard {
  position: relative;
}

.cc-videoCard video.cc-img {
  pointer-events: none; /* forces click to button */
}

.cc-videoPlayBtn {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cc-videoPlayBtn:hover {
  background: rgba(0,0,0,0.15);
}



  /* ------ Responsive Grid ------ */
  .cc-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
  }

  /* ------ Image Card ------ */
  .cc-card {
    position: relative;
    overflow: hidden;
    border-radius: 20px;
    background: #fff;
    padding: 0;
    box-shadow: 0 8px 26px rgba(102,42,9,0.12);
    transition: transform .2s ease, box-shadow .2s ease;
  }

  .cc-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 18px 36px rgba(102,42,9,0.16);
  }

  .cc-img {
    width: 100%;
    height: 200px;
    border-radius: 18px;
    object-fit: cover;
    display: block;
    transition: transform .35s ease;
  }

  .cc-card:hover .cc-img {
    transform: scale(1.07);
  }

  /* ------ Caption Overlay ------ */
  .cc-caption {
    position: absolute;
    left: 10px;
    right: 10px;
    bottom: 10px;
    padding: 14px 16px;
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    border-radius: 16px;
    background: linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,0.7) 100%);
  }

  /* ------ Skeleton Loaders ------ */
  .cc-skel {
    height: 260px;
    border-radius: 22px;
    background: linear-gradient(90deg, #f8ebe2, #fdf6f0, #f8ebe2);
    background-size: 400% 100%;
    animation: shimmer 1.4s infinite;
  }

  @keyframes shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: 0 0; }
  }

  /* ------ Status ------ */
  .cc-empty,
  .cc-loadingMore {
    text-align: center;
    font-size: 15px;
    color: #865940;
    padding: 18px 0;
  }

  @media (max-width: 768px) {
    .cc-heading {
      flex-direction: column;
    }
    .cc-grid {
      gap: 16px;
    }
    .cc-img,
    .cc-skel {
      height: 220px;
    }
  }

  @media (max-width: 540px) {
    .cc-gallerySection {
      padding: 90px 0 60px;
    }
    .cc-manageBtn {
      width: 100%;
      justify-content: center;
    }
  }
`}</style>

    </>
  );
};

export default GalleryPage;

function VideoLightbox({ open, src, title, onClose }) {
  const canRender = typeof document !== "undefined";

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open || !canRender) return null;

  return createPortal(
    <div
      className="cc-modalOverlay"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Video"}
      onMouseDown={onClose}
    >
      <div className="cc-modalPanel" onMouseDown={(e) => e.stopPropagation()}>
        <div className="cc-modalHeader">
          <div className="cc-modalTitle">{title || "Video"}</div>
          <button className="cc-modalClose" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="cc-modalBody">
          <div className="cc-videoFrame">
            <video
              key={src}
              src={src}
              controls
              autoPlay
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
