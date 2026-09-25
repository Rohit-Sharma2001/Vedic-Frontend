'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// import SubHeader from '../../SubHeader/page';
import Header from '../../Header/page';
import "../../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "react-quill/dist/quill.snow.css";
import { config } from 'services/config';
import { postApi } from 'services/api';
import { Trash, } from "react-bootstrap-icons";
import Swal from 'sweetalert2';
const ArticleDetails = ({ params }) => {
  const id = params.articleid;
  const [featuredArticle, setFeaturedArticle] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(null);
  const [userData, setUserData] = useState()
  let copyTimerRef = null; // module-scoped cleanup (Next.js fast refresh safe)
  // 1) STATE — near other useState lines
  const [shareLinks, setShareLinks] = useState({ fb: '#', li: '#', tw: '#' });

  const [formData, setFormData] = useState({
    id: id,
    title: '',
    descriptions: '',
    auther_name: '',
    image: null,
    file: null
  });
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [likeSaving, setLikeSaving] = useState(false);
  const [likeError, setLikeError] = useState(null);
  const [likesCount, setLikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const fetchArticles = async (page) => {
    try {
      const endpoint = config.Articles;
      const data = { page, pageSize };
      const response = await postApi(endpoint, data);
      // Sort by date desc (newest first). If date missing/invalid, treat as 0.
      const toTime = (x) => (x?.date ? Date.parse(x.date) || 0 : 0);
      const sorted = (response.resultWithUrls || []).sort((a, b) => toTime(b) - toTime(a));
      setArticles(sorted);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };
  useEffect(() => {
    setArticles((prev) => {
      const toTime = (x) => (x?.date ? Date.parse(x.date) || 0 : 0);
      return [...prev].sort((a, b) => toTime(b) - toTime(a));
    });
  }, [currentPage]); // or any deps that change the list
  useEffect(() => {
    fetchArticles(currentPage);
    if (id) fetchArticleDetails();
    fetchFeaturedArticle();
  }, [id]);

  // 2) EFFECT — build share URLs from current URL + article title
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const title = formData?.title || 'Check this out';

    const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    const li = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    const tw = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

    setShareLinks({ fb, li, tw });
  }, [formData?.title]); // re-compute when title changes

  const getUserId = () => {
    try {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed && parsed._id ? parsed._id : null;
    } catch {
      return null;
    }
  };

  const copyUrl = async (e) => {
    e?.preventDefault?.();
    setCopyError(null);

    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (!url) return;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback: create a temporary input and execCommand
        const el = document.createElement('input');
        el.value = url;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
      }
      setCopied(true);
      clearTimeout(copyTimerRef);
      copyTimerRef = setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      setCopyError('Copy failed');
    }
  };

  // optional: cleanup timer
  useEffect(() => {
    return () => { if (copyTimerRef) clearTimeout(copyTimerRef); };
  }, []);
  const openReview = () => {
    setError(null);
    setCommentText('');
    setIsReviewOpen(true);
  };

  const closeReview = () => {
    if (!saving) setIsReviewOpen(false);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserData(user)
  }, [])


  // 2) LIKE HANDLER — place near other helpers
  const likeArticle = async () => {
    setLikeError(null);
    const user_id = getUserId();
    if (!user_id) {
      setLikeError('Please login to like this article.');
      return;
    }
    try {
      setLikeSaving(true);
      const res = await postApi(config.LikeArticle, { article_id: id, user_id });
      // Server may return 201 on success; 409 if already liked
      if (res?.statusCode === 201 || res?.statusCode === 200) {
        await fetchArticleDetails();
      } else if (res?.statusCode === 409) {
        setHasLiked(true);
      } else {
        setLikeError(res?.message || 'Failed to like.');
      }
    } catch (e) {
      setLikeError(e?.response?.data?.message || 'Failed to like.');
    } finally {
      setLikeSaving(false);
    }
  };

  const submitReview = async () => {
    setError(null);
    const user_id = getUserId();
    if (!user_id) {
      setError('Please login to comment.');
      return;
    }
    if (!commentText.trim()) {
      setError('Comment cannot be empty.');
      return;
    }
    try {
      setSaving(true);

      const endpoint = config.AddArticleComment;
      const payload = { article_id: id, user_id, comment: commentText.trim() };
      const res = await postApi(endpoint, payload);
      if (res && (res.statusCode === 201 || res.statusCode === 200)) {
        await fetchArticleDetails(); // refresh details/comments
        setIsReviewOpen(false);
        setCommentText('');
      } else {
        setError(res?.message || 'Failed to add comment.');
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to add comment.');
    } finally {
      setSaving(false);
    }
  };

  // Optional: close modal on ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeReview(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, []);


  const updateArticleViewCount = async (id) => {
    try {
      const endpoint = config.UpdateArticleCount; // make sure this exists in config
      const data = { id };
      const response = await postApi(endpoint, data);

      if (response.statusCode === 200) {


      } else {
        console.error("Failed to update article view count.");
      }
    } catch (error) {
      console.error("Error updating article view count:", error);
    }
  };

  const fetchFeaturedArticle = async () => {
    try {
      const endpoint = config.GetFeaturedArticle; // should point to /article_management/get-featured
      const data = {};
      const response = await postApi(endpoint, data);


      if (response.statusCode === 200) {
        setFeaturedArticle(response.data);
      }
    } catch (error) {
      console.error("Error fetching featured article:", error);
    }
  };

  const formatDate = (v) => {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };
  const fetchArticleDetails = async () => {
    try {
      const endpoint = config.ViewArticles;
      const data = { id: id };
      const response = await postApi(endpoint, data);
      console.log("artilces details ", response);

      if (response.statusCode === 201) {
        const article = response.result;
        const sortedComments = (article?.comments || []).slice().sort(
          (a, b) => new Date(b?.date || 0) - new Date(a?.date || 0)
        );
        setFormData({ ...article, comments: sortedComments });
        // likes UI
        const lc = Array.isArray(article?.likes) ? article.likes.length : 0;
        setLikesCount(lc);
        const uid = getUserId();
        const liked = !!article?.likes?.some(l => (l?.user_id?._id || l?.user_id) === uid);
        setHasLiked(liked);

        updateArticleViewCount(id);
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
    }
  };

  const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase() || "";
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const arrayheader = [
    { name: "Schedule", route: "/LandingPage/components/AmitaHome" },
    { name: "Free Clinic", route: "/LandingPage/components/FreeClinic" },
    { name: "Classes", route: "/YogaClasses/components/JoinYogaClasses" },
    { name: "Book & Articles", route: "/LandingPage/components/BookArticles" },
    { name: "Talks", route: "/LandingPage/components/TalksByAmita" },
    { name: "Case Studies", route: "/LandingPage/components/CaseStories" },
    { name: "About", route: "/LandingPage/components/AmitajainLandingPage" },
  ];

  const confirmDelete = (id, commentId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteArticle(id, commentId);

      }
    });
  };

  const deleteArticle = async (id, commentId) => {
    try {
      const endpoint = config.deleteArticlesComment;
      const data = { id, commentId };
      await postApi(endpoint, data);
      Swal.fire("Deleted!", "Article has been deleted.", "success");
      fetchArticles(currentPage);
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  };

  return (<>
    <Header arrayheader={arrayheader} />
    {/* <SubHeader /> */}
    <section className="blogBanner">
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <div className="blogLeft row mb-3">
              <div className="col-md-4">
                <figure>
                  <img src={`${process.env.NEXT_PUBLIC_API_URL}/${formData?.file}`} alt="hello" className="blogfirstImg" />
                </figure>
              </div>
              <div className="col-md-8">
                <div className="text-start">
                  <div className="healthHeading mb-3 text-start">
                    <span>{formData?.title}</span>
                  </div>
                  {/* <p>{formData?.descriptions}</p> */}
                  <div className="article-description" dangerouslySetInnerHTML={{ __html: formData?.descriptions }} />
                </div>
              </div>
            </div>

            <div className="article-content-wrapper">
              <div className="article-content" dangerouslySetInnerHTML={{ __html: formData?.article_content }} />
            </div>

            <div className="comentSec my-0 border-0 border-top mt-3 mt-md-5">
              <div className="d-flex align-items-center justify-content-between w-100">
                <div className="d-flex align-items-center justify-content-between w-100">
                  <strong className="fw-bold">WRITE A COMMENT</strong>
                  <button type="button" className="btn btn-primary" onClick={openReview}>
                    Leave a comment
                  </button>
                </div>

                {/* <button type="button" className="btn btn-primary" onClick={openReview}>
              Write a Review
             </button> */}
              </div>

              {likeError && <div className="cc-like-error mt-2">{likeError}</div>}
            </div>
            <div className="comentSec mt-0">

              <div className="d-flex align-items-center justify-content-between flex-wrap">
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <strong>{(formData?.comments?.length || 0)} COMMENTS</strong>



                  <button
                    type="button"
                    className="cc-like-inline d-inline-flex align-items-center gap-2"
                    onClick={async () => {
                      setLikeError(null);
                      const user_id = getUserId();
                      if (!user_id) { setLikeError('Please login to like this article.'); return; }
                      try {
                        setLikeSaving(true);
                        const res = await postApi(config.LikeArticle, { article_id: id, user_id });
                        // backend returns { statusCode, action: 'liked' | 'unliked', likesCount }
                        if (res?.statusCode === 200) {
                          setHasLiked(res.action === 'liked');
                          setLikesCount(res.likesCount ?? likesCount);
                        } else {
                          // fallback: re-fetch if anything unexpected
                          await fetchArticleDetails();
                        }
                      } catch (e) {
                        setLikeError(e?.response?.data?.message || 'Failed to like.');
                      } finally {
                        setLikeSaving(false);
                      }
                    }}
                    disabled={likeSaving}  // <-- do NOT disable when liked; only during request
                    aria-pressed={hasLiked}
                  >
                    <span>{hasLiked ? 'Liked' : 'Like'}</span>

                    {hasLiked ? (
                      <lottie-player
                        src="/images/landingpage/like.json"
                        loop
                        autoplay
                        style={{ width: '35px', height: '35px' }}
                      />
                    ) : (
                      <img
                        src="/images/landingpage/heartblog-icon.svg"
                        alt=""
                        width="16"
                        height="16"
                      />
                    )}

                    <span className="cc-like-num">{likesCount}</span>
                  </button>



                </div>

                <div className="d-flex shareIcon">
                  <span className="pe-3 fw-normal">Share: <img src="" alt="" /></span>
                  <div className="d-flex gap-3">
                    <a href={shareLinks.fb} target="_blank" rel="noopener noreferrer" className="d-flex gap-1" aria-label="Share on Facebook">
                      <img src="/images/landingpage/facebookblog-icon.svg" alt="Facebook" width="24" height="24" />
                    </a>
                    <a href={shareLinks.li} target="_blank" rel="noopener noreferrer" className="d-flex gap-1" aria-label="Share on LinkedIn">
                      <img src="/images/landingpage/linkdinblog-icon.svg" alt="LinkedIn" width="24" height="24" />
                    </a>
                    <a href={shareLinks.tw} target="_blank" rel="noopener noreferrer" className="d-flex gap-1" aria-label="Share on X">
                      <img src="/images/landingpage/twitterblog-icon.svg" alt="X (Twitter)" width="24" height="24" />
                    </a>
                  </div>
                </div>

              </div>

            </div>



            <div className="commentsMain">
              <strong className="mb-4 d-block">COMMENTS</strong>
              <ul className="commentUl">
                {(formData?.comments || []).map((c, idx) => {
                  const u = c?.user_id || {};
                  const displayName = u?.name || u?.email || 'Anonymous';
                  return (
                    <li key={c?._id || idx}>
                      <figure >
                        <div
                          className="d-flex justify-content-center align-items-center"
                          style={{
                            width: "50px",
                            height: "50px",
                            backgroundColor: "#E0E0E0",
                            fontSize: "16px",
                            fontWeight: "bold",
                            color: "#662A09",
                            borderRadius: "30px",
                          }}
                        >
                          {getInitials(
                            displayName
                          )}
                        </div>
                      </figure>
                      {console.log(userData?._id, "oo", u, "userData?._id==u")}
                      <div className="copyLink" >
                        {userData?._id == u?._id && <span
                          onClick={() => confirmDelete(id, c._id)}
                          style={{ cursor: "pointer", color: "#662A09", marginRight: "10px" }}
                        >
                          <Trash size={20} />
                        </span>}
                        <a href="#" onClick={copyUrl} aria-label="Copy page link">
                          <img src="/images/landingpage/copy-link.svg" alt="" width="24" height="24" />

                        </a></div>

                      <div className="contentComt">
                        <h6>{displayName}</h6>
                        <span> Reviewed on {formatDate(c?.date)}</span>
                        <p>{c?.comment}</p>

                        {/* <div className="d-flex align-items-center gap-3 ms-md-4">
            <a href="#" className="d-flex gap-3 text-secondary" onClick={(e) => e.preventDefault()}>
              LIKE
              <img src="/images/landingpage/like-gray-icon.svg" alt="" width="16" />
            </a>
            <a href="#" className="d-flex align-items-center gap-3 text-secondary" onClick={(e) => e.preventDefault()}>
              REPLY
              <img src="/images/landingpage/reply-icon.svg" alt="" width="16" />
            </a>
          </div> */}
                      </div>
                    </li>
                  );
                })}
                {(formData?.comments?.length || 0) === 0 && (
                  <li>
                    <div className="contentComt">
                      <p className="text-secondary m-0">No comments yet. Be the first to review.</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="featuredPosts">
              <h6 className="mb-3 fw-semibold">Featured Post</h6>
              {featuredArticle ? (
                <>
                  <Link href={`/LandingPage/components/ArticleDetails/${featuredArticle._id}`}>
                    <figure>
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${featuredArticle.file}`}
                        alt=""
                        className="featureImg"
                        width={400}
                        height={300}
                      />
                    </figure>
                  </Link>
                  <div className="healthHeading text-start mb-3">
                    <h2 className="mb-1">{featuredArticle.title}</h2>
                    <span>{featuredArticle.auther_name}</span>
                  </div>
                </>
              ) : (
                <p>No featured article available.</p>
              )}
              <hr />
              <h6 className="mb-1 fw-semibold">Recent Posts</h6>
              <ul className="recentUl">
                {articles.map((post, idx) => (
                  <li className="d-flex align-items-center gap-3" key={idx}>
                    <figure className="m-0">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${post.file}`}
                        alt=""
                        width={64}
                        height={64}
                      />
                    </figure>
                    <div>
                      <h6>{post.title}</h6>
                      <Link href={`/LandingPage/components/ArticleDetails/${post._id}`}>
                        Learn More
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>
    </section>

    {isReviewOpen && (
      <div className="cc-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="cc-modal-title">
        <div className="cc-modal">
          <div className="cc-modal-header">
            <h5 id="cc-modal-title">Leave a comment</h5>
            <button type="button" className="cc-close" onClick={closeReview} aria-label="Close">×</button>
          </div>
          <div className="cc-modal-body">
            <label htmlFor="cc-comment" className="cc-label">Your Comment</label>
            <textarea
              id="cc-comment"
              className="cc-textarea"
              rows={6}
              maxLength={2000}
              placeholder="Share your thoughts..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />
            <div className="cc-meta">
              <span>{commentText.length}/2000</span>
            </div>
            {error && <div className="cc-error">{error}</div>}
          </div>
          <div className="cc-modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeReview} disabled={saving}>
              Cancel
            </button>
            <button type="button" className="btn btn-primary" onClick={submitReview} disabled={saving}>
              {saving ? 'Saving…' : 'Save Comment'}
            </button>
          </div>
        </div>
      </div>
    )}

    {copied && <div className="cc-toast">Link copied!</div>}
    {copyError && <div className="cc-toast cc-toast-error">{copyError}</div>}


    <style jsx>{`
  .shareIcon a { opacity: 0.9; transition: transform .12s ease, opacity .12s ease; }
  .shareIcon a:hover { opacity: 1; transform: translateY(-1px); }
`}</style>

    <style jsx>{`
  .cc-toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    background: #0f172a;
    color: #fff;
    padding: 8px 12px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 0.9rem;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 2000;
    animation: cc-pop 180ms ease-out;
  }
  .cc-toast-error { background: #b91c1c; }
  @keyframes cc-pop {
    from { opacity: 0; transform: translate(-50%, 6px); }
    to   { opacity: 1; transform: translate(-50%, 0); }
  }
`}</style>

    <style jsx>{`
  .cc-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.55);
    display: grid;
    place-items: center;
    padding: 1rem;
    z-index: 1050;
    backdrop-filter: blur(2px);
  }
  .cc-modal {
    width: 100%;
    max-width: 640px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(2, 6, 23, 0.2);
    overflow: hidden;
    animation: cc-fade-in 140ms ease-out;
  }
  .cc-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-bottom: 1px solid #eef2f7;
  }
  .cc-modal-header h5 {
    margin: 0;
    font-weight: 700;
    color: #0f172a;
  }
  .cc-close {
    border: 0;
    background: transparent;
    font-size: 22px;
    line-height: 1;
    cursor: pointer;
    color: #475569;
  }
  .cc-close:hover { color: #0f172a; }

  .cc-modal-body { padding: 16px; }
  .cc-label {
    display: block;
    font-size: 0.9rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 8px;
  }
  .cc-textarea {
    width: 100%;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 14px;
    resize: vertical;
    outline: none;
    transition: box-shadow 0.15s ease, border-color 0.15s ease;
    font-size: 0.95rem;
  }
  .cc-textarea:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }
  .cc-meta {
    display: flex;
    justify-content: flex-end;
    margin-top: 6px;
    font-size: 12px;
    color: #64748b;
  }
  .cc-error {
    margin-top: 10px;
    color: #b91c1c;
    background: #fef2f2;
    border: 1px solid #fecaca;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 0.9rem;
  }
  .cc-modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 16px;
    border-top: 1px solid #eef2f7;
    background: #fafbfe;
  }
  .cc-btn {
    border: 0;
    padding: 10px 14px;
    border-radius: 10px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.05s ease, box-shadow 0.15s ease, background 0.15s ease;
  }
  .cc-btn:active { transform: translateY(1px); }
  .cc-btn-primary {
    background: #624bff;
    color: #fff;
    box-shadow: 0 8px 20px rgba(98, 75, 255, 0.25);
  }
  .cc-btn-primary:hover { background: #4e3be0; }
  .cc-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }
  .cc-btn-light { background: #e2e8f0; color: #0f172a; }
  @keyframes cc-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  }
`}</style>

    <style jsx>{`
  .commentUl { list-style: none; padding: 0; margin: 0; }
  .commentUl li { display: flex; gap: 12px; padding: 16px 0; border-bottom: 1px solid #eef2f7; }
  .contentComt h6 { margin: 0 0 4px; font-weight: 700; }
  .contentComt span { display: block; font-size: 12px; color: #64748b; margin-bottom: 8px; }
  .contentComt p { margin: 0 0 8px; }
`}</style>



    <style jsx>{`
  .cc-like {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid #e2e8f0;
    background: #fff;
    color: #0f172a;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s ease, box-shadow 0.15s ease, transform 0.05s ease;
  }
  .cc-like:hover { background: #f8fafc; }
  .cc-like:active { transform: translateY(1px); }
  .cc-like .cc-like-heart { color: #ef4444; }
  .cc-like.liked {
    border-color: #fecaca;
    background: #fff1f2;
    color: #991b1b;
  }
  .cc-like.liked .cc-like-heart { color: #dc2626; }
  .cc-like-count { font-weight: 500; opacity: 0.8; }
  .cc-like:disabled { opacity: 0.6; cursor: not-allowed; }

  .cc-like-error {
    color: #b91c1c;
    background: #fef2f2;
    border: 1px solid #fecaca;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 0.9rem;
  }
`}</style>
    <style jsx>{`
  .cc-like-text {
    border: 0;
    background: transparent;
    padding: 0;
    font-weight: 700;
    cursor: pointer;
    color: #0f172a;
  }
  .cc-like-text .cc-heart { font-size: 16px; line-height: 1; }
  .cc-like-text:hover .cc-heart { transform: scale(1.05); }
  .cc-like-text:disabled { opacity: 0.6; cursor: not-allowed; }
  .cc-like-text.liked { color: #991b1b; }

  .cc-divider {
    width: 1px;
    height: 20px;
    background: #e2e8f0;
    display: inline-block;
  }
`}</style>

    <style jsx>{`
  .cc-vbar {
    width: 1px;
    height: 20px;
    background: #e5e7eb; /* same subtle divider */
    display: inline-block;
  }
  .cc-like-inline {
    border: 0;
    background: transparent;
    padding: 0;
    margin: 0;
    font-weight: 700;
    cursor: pointer;
    color: #0f172a;
  }
  .cc-like-inline:disabled {
    cursor: default;
    opacity: 0.9;
  }
  .cc-like-num {
    font-weight: 600;
  }
`}</style>

    <style jsx global>{`
  .article-description,
  .article-content,
  .article-content-wrapper {
    line-height: 1.6;
    color: #333;
  }
  
  /* Unordered lists */
  .article-description ul,
  .article-content ul,
  .article-content-wrapper ul {
    list-style-type: disc !important;
    list-style-position: outside !important;
    margin: 1em 0 !important;
    margin-top: 1em !important;
    margin-bottom: 1em !important;
    padding-left: 2.5em !important;
    display: block !important;
  }
  
  /* Ordered lists */
  .article-description ol,
  .article-content ol,
  .article-content-wrapper ol {
    list-style-type: decimal !important;
    list-style-position: outside !important;
    margin: 1em 0 !important;
    margin-top: 1em !important;
    margin-bottom: 1em !important;
    padding-left: 2.5em !important;
    display: block !important;
  }
  
  /* List items - must override global li { list-style: none; } */
  .article-description ul li,
  .article-content ul li,
  .article-content-wrapper ul li {
    list-style-type: disc !important;
    list-style-position: outside !important;
    margin: 0.5em 0 !important;
    margin-top: 0.5em !important;
    margin-bottom: 0.5em !important;
    padding-left: 0 !important;
    line-height: 1.6 !important;
    display: list-item !important;
  }
  
  .article-description ol li,
  .article-content ol li,
  .article-content-wrapper ol li {
    list-style-type: decimal !important;
    list-style-position: outside !important;
    margin: 0.5em 0 !important;
    margin-top: 0.5em !important;
    margin-bottom: 0.5em !important;
    padding-left: 0 !important;
    line-height: 1.6 !important;
    display: list-item !important;
  }
  
  /* Nested list items */
  .article-description ul ul li,
  .article-content ul ul li,
  .article-content-wrapper ul ul li {
    list-style-type: circle !important;
  }
  
  .article-description ul ul ul li,
  .article-content ul ul ul li,
  .article-content-wrapper ul ul ul li {
    list-style-type: square !important;
  }
  
  .article-description ol ol li,
  .article-content ol ol li,
  .article-content-wrapper ol ol li {
    list-style-type: lower-alpha !important;
  }
  
  .article-description ol ol ol li,
  .article-content ol ol ol li,
  .article-content-wrapper ol ol ol li {
    list-style-type: lower-roman !important;
  }
  
  /* Nested unordered lists */
  .article-description ul ul,
  .article-content ul ul,
  .article-content-wrapper ul ul {
    list-style-type: circle !important;
    margin: 0.5em 0 !important;
    padding-left: 2em !important;
  }
  
  .article-description ul ul ul,
  .article-content ul ul ul,
  .article-content-wrapper ul ul ul {
    list-style-type: square !important;
  }
  
  /* Nested ordered lists */
  .article-description ol ol,
  .article-content ol ol,
  .article-content-wrapper ol ol {
    list-style-type: lower-alpha !important;
  }
  
  .article-description ol ol ol,
  .article-content ol ol ol,
  .article-content-wrapper ol ol ol {
    list-style-type: lower-roman !important;
  }
  
  /* Mixed nesting */
  .article-description ul ol,
  .article-content ul ol,
  .article-content-wrapper ul ol,
  .article-description ol ul,
  .article-content ol ul,
  .article-content-wrapper ol ul {
    margin: 0.5em 0 !important;
    padding-left: 2em !important;
  }
  
  /* Paragraphs */
  .article-description p,
  .article-content p,
  .article-content-wrapper p {
    margin: 1em 0;
  }
  
  /* Headings */
  .article-description h1,
  .article-content h1,
  .article-content-wrapper h1,
  .article-description h2,
  .article-content h2,
  .article-content-wrapper h2,
  .article-description h3,
  .article-content h3,
  .article-content-wrapper h3,
  .article-description h4,
  .article-content h4,
  .article-content-wrapper h4,
  .article-description h5,
  .article-content h5,
  .article-content-wrapper h5,
  .article-description h6,
  .article-content h6,
  .article-content-wrapper h6 {
    margin: 1.5em 0 1em 0;
    font-weight: 600;
  }
  
  /* Bold text */
  .article-description strong,
  .article-content strong,
  .article-content-wrapper strong,
  .article-description b,
  .article-content b,
  .article-content-wrapper b {
    font-weight: 600;
  }
`}</style>

  </>);
}
export default ArticleDetails;
