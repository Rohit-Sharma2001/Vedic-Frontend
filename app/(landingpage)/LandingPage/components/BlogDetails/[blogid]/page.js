"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Header from "../../Header/page";
import BlogSection from "../../BlogSection/page";
import FooterSection from "../../Footer/page";
import { postApi, updateApiWithFile } from "services/api";
import { config } from "services/config";
import '../../../public/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Trash, } from "react-bootstrap-icons";
import Swal from 'sweetalert2';
// import SubHeader from "../../SubHeader/page";

const Blogs = ({ params }) => {
    const id = params.blogid;
    const [blogs, setBlog] = useState(null);
    const [recentblogs, setRecentBlogs] = useState([]);
    const [filteredblogs, setFilteredBlogs] = useState({});
    const [likeSaving, setLikeSaving] = useState(false);
    const [likeError, setLikeError] = useState(null);
    const [likesCount, setLikesCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [error, setError] = useState(null);
      const [copied, setCopied] = useState(false);
      const [copyError, setCopyError] = useState(null);
      const [userData, setUserData] = useState()
      const [saving, setSaving] = useState(false);

    let copyTimerRef = null; // module-scoped cleanup (Next.js fast refresh safe)
    // 1) STATE — near other useState lines
    const [shareLinks, setShareLinks] = useState({ fb: '#', li: '#', tw: '#' });
    const router = useRouter();
     const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
    const [formData, setFormData] = useState({
        id: id,
        viewCount: 0,
        title: '',
        descriptions: '',
        auther_name: '',
        image: null,
        file: null
    });

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top when page loads
    }, []);

    const arrayheader = [
        { name: "Ayurveda", route: "/LandingPage/components/AyurvedaHealing" },
        { name: "Yoga ", route: "/YogaClasses/components/JoinYogaClasses" },

        {
            name: "Programs",
            route: "/Events",
            children: [
                { name: "Events", route: "/Events" },
                { name: "Courses", route: "/YogaClasses/Yoga-Courses" },

            ]
        },
        { name: "Shop", route: "/Shop" },
        {
            name: "Education",
            route: "/LandingPage/components/Blogs",
            children: [
                { name: "Blogs", route: "/LandingPage/components/Blogs" },

            ]
        },
        { name: "Amita Jain", route: "/LandingPage/components/AmitaHome" },

    ];

    useEffect(() => {
        if (id) {
            fetchBlogDetails();
            fetchBlogs();
        }
    }, [id]);
    useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserData(user)
  }, [])

    const openReview = () => {
    setError(null);
    setCommentText('');
    setIsReviewOpen(true);
  };

  const closeReview = () => {
    if (!saving) setIsReviewOpen(false);
  };

    const fetchBlogs = async () => {
        try {
            const endpoint = config.Blogs;
            const response = await postApi(endpoint, {});
            const allBlogs = response.CenterManagementWithUrls || [];
            const activeBlogs = allBlogs.filter((blog) => blog.status === "Active");

            // Filter out blogs where isFeaturedPost is 1
            const filteredBlogs = (activeBlogs || []).filter(
                blog => blog.isFeaturedPost == 1
            );

            setFilteredBlogs(filteredBlogs);
            setRecentBlogs(activeBlogs);
        } catch (error) {
            console.error("Error fetching blogs:", error);
        }
    };

    const fetchBlogDetails = async () => {
        try {
            const endpoint = config.Viewblog;
            const response = await postApi(endpoint, { id });

            if (response.statusCode === 201) {
                const updatedViewCount = (response.blogManagementData?.viewCount || 0) + 1;
                const article = response?.blogManagementData;
        const sortedComments = (article?.comments || []).slice().sort(
          (a, b) => new Date(b?.date || 0) - new Date(a?.date || 0)
        );
                setBlog(response.blogManagementData);
                setFormData((prevData) => ({
                    ...prevData,
                    viewCount: updatedViewCount, comments: sortedComments
                }));

                const lc = Array.isArray(article?.likes) ? article.likes.length : 0;
        setLikesCount(lc);
        const uid = getUserId();
        const liked = !!article?.likes?.some(l => (l?.user_id?._id || l?.user_id) === uid);
        setHasLiked(liked);

                // Ensure view count is updated AFTER setting state
                updateViewCount(updatedViewCount);
            }
        } catch (error) {
            console.error("Error fetching blog details:", error);
        }
    };

    const updateViewCount = async (updatedViewCount) => {
        try {
            const endpoint = config.Updateblog;
            const data = {
                id: id,
                viewCount: updatedViewCount,
            };
            const files = {};

            console.log("Updating view count:", data);
            const response = await updateApiWithFile(endpoint, id, data, files);

            if (response.statusCode === 200) {
                console.log("View count updated successfully!");
            } else {
                console.error("Failed to update view count.");
            }
        } catch (error) {
            console.error("Error updating blog:", error);
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

      const endpoint = config.AddBlogComment;
      const payload = { article_id: id, user_id, comment: commentText.trim() };
      const res = await postApi(endpoint, payload);
      if (res && (res.statusCode === 201 || res.statusCode === 200)) {
         fetchBlogDetails(); // refresh details/comments
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


    const handleNavigation = (route) => {
        if (route) {
            router.push(`/LandingPage/components/BlogDetails/${route}`);
        }
    };

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

  const getInitials = (name = "") => {
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase() || "";
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const formatDate = (v) => {
    if (!v) return '';
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };
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
        const endpoint = config.deleteBlogComment;
        const data = { id, commentId };
        await postApi(endpoint, data);
        Swal.fire("Deleted!", "Comment has been deleted.", "success");
        // fetchArticles(currentPage);
        fetchBlogDetails()
      } catch (error) {
        console.error("Error deleting article:", error);
      }
    };
    return (
        <>
            <Header arrayheader={arrayheader} />
            {/* <SubHeader /> */}
            {/* <BlogSection blogs={blog} recentblogs={recentBlogs} filteredblogs={filteredblogs} /> */}

            <section className="blogBanner">
                <div className="container">
                    <div className="row">
                        {/* Blog Left Section */}
                        <div className="col-lg-8">
                            <div className="blogLeft">
                                <figure>
                                    <img
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${blogs?.file}`}
                                        alt=""
                                        className="blogfirstImg"
                                    />
                                </figure>
                                <div className="healthHeading mb-3">
                                    <h2 className="mb-2">Vedic Yours</h2>
                                    <span>{blogs?.title}</span>
                                </div>
                                <div className="blogContent" style={{ color: "black" }}>
                                    <div
                                        dangerouslySetInnerHTML={{ __html: blogs?.description }}
                                    />
                                </div>
                                {/* 
              <div>
                <strong className="mb-2 d-block">
                  Health benefits of abhyanga :
                </strong>
                <ul className="overviewUl mb-4">
                  {[
                    "Rejuvenates and tones the skin",
                    "Cleanses the pores and makes skin soft",
                    "Maintains musculoskeletal and nervous system health",
                    "Strengthens Dhatus and increases stamina",
                    "Improves circulation and lymph drainage",
                    "Improves sleep patterns",
                    "Delays aging",
                    "Improves vision",
                    "Helps grow lustrous hair",
                    "Nourishes the whole body",
                    "Balances the doshas, especially Vata",
                  ].map((item, index) => (
                    <li key={index}>
                      <img
                        src="/images/landingpage/accordian-icon.svg"
                        alt=""
                        width="12"
                      />
                      <p className="m-0">{item}</p>
                    </li>
                  ))}
                </ul>
              </div> */}

                                {/* <hr />
              <p>
                Moreover, a study published by Granstein, Richard D et al in
                Neuroimmunology of the skin states that oiling the skin everyday
                helps keep the skin microbiome healthy, which in turn supports
                our immunity, and the active communication between the skin
                microbes, the environmental microbes, the gut microbes, and the
                function of the whole body. If the skin dries out, which is the
                common manifestation of Vata dosha imbalance, the skin
                microbiome weakens, so does our immunity, longevity and
                vitality. So, protecting the skin, which is the largest organ of
                our body with billions of microbes, turns out to be the most
                important health and longevity factors.{" "}
              </p>

              <hr />
              <div>
                <strong className="mb-2 d-block">
                  Various types of Abhyanga and their role:
                </strong>
                <strong className="mb-2 d-block fs-8">Siro Abhyanga:</strong>
                <p>
                  This procedure/bodywork involves application of medicated oils
                  on head, neck and shoulders region. Since these areas are more
                  prone to stress and tension, it relives stress and stress
                  related conditions.
                </p>

                <ul className="overviewUl mb-4">
                  {[
                    "Prevents headaches",
                    "Prevents hair fall and balding",
                    "Promotes hair growth",
                    "Strengthens skull bones",
                    "Brightens facial skin",
                    "Promotes sound sleep",
                  ].map((item, index) => (
                    <li key={index}>
                      <img
                        src="/images/landingpage/accordian-icon.svg"
                        alt=""
                        width="12"
                      />
                      <p className="m-0">{item}</p>
                    </li>
                  ))}
                </ul>

                <p>Other types of Abhyanga include:</p>
                <ul className="overviewUl mb-4">
                  {[
                    "Griva Abhyanga",
                    "Mukha Abhyanga",
                    "Deha Abhyanga",
                    "Pada Abhyanga",
                  ].map((item, index) => (
                    <li key={index}>
                      <img
                        src="/images/landingpage/accordian-icon.svg"
                        alt=""
                        width="12"
                      />
                      <p className="m-0">{item}</p>
                    </li>
                  ))}
                </ul>

                <p>
                  Consult your Ayurvedic Yours Practitioner for personalized
                  advice.
                </p>
              </div>

              <span className="visitPage mb-5">
                To book an Abhyanga, <a href="#">visit our Panchakarma page.</a>
              </span> */}

                                {/* Comment Section */}
                                {/* <div className="comentSec">
                <div className="d-flex align-items-center">
                  <strong>3 COMMENTS</strong>
                  <a href="#" className="d-flex gap-1">
                    <span>Like</span>
                    <img src="/images/landingpage/heartblog-icon.svg" alt="" width="16" />
                  </a>
                </div>

                <div className="d-flex shareIcon">
                  <span className="pe-3 fw-normal">Share:</span>
                  <div className="d-flex gap-3">
                    {['facebookblog-icon.svg', 'linkdinblog-icon.svg', 'twitterblog-icon.svg'].map((icon, index) => (
                      <a href="#" key={index}>
                        <img src={`/images/landingpage/${icon}`} alt="" width="24" />
                      </a>
                    ))}
                  </div>
                </div>
              </div> */}

                                {/* Author Section */}
                                {/* <div className="editor">
                <figure className="m-0">
                  <img src="/images/landingpage/smith-jhons.png" alt="" />
                </figure>
                <div>
                  <h6>
                    Om Prakash Sanduja, <span>(Ayurvedic Wellness Counselor)</span>
                  </h6>
                  <p>The Ayurveda information provided here is solely for educational purposes.</p>
                </div>
              </div> */}

                                {/* <hr className="mt-4" /> */}

                                {/* Comments Section */}
                                {/* <div className="commentsMain">
                <strong className="mb-4 d-block">COMMENTS</strong>
                <ul className="commentUl">
                  {[1, 2, 3].map((comment, index) => (
                    <li key={index}>
                      <figure>
                        <img src="/images/landingpage/smith-jhons.png" alt="" />
                      </figure>
                      <a href="#" className="copyLink">
                        <img src="/images/landingpage/copy-link.svg" alt="" width="24" />
                      </a>
                      <div className="contentComt">
                        <h6>Smith Jhons </h6>
                        <span>Reviewed on 18 July 2022</span>
                        <p>
                          Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has
                          been the industry's standard dummy text ever since the 1500s.
                        </p>
                        <div className="d-flex gap-2 ms-md-4">
                          <a href="#" className="d-flex align-items-center gap-2 text-secondary">
                            LIKE
                            <img src="/images/landingpage/like-gray-icon.svg" alt="" width="16" />
                          </a>
                          <a href="#" className="d-flex align-items-center gap-3 text-secondary">
                            REPLY
                            <img src="/images/landingpage/reply-icon.svg" alt="" width="16" />
                          </a>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div> */}
                            </div>
                            <div className="comentSec my-0 border-0 border-top mt-3 mt-md-5">
                                <div className="d-flex align-items-center justify-content-between w-100">
                                    <div className="d-flex align-items-center justify-content-between w-100">
                                        <strong className="fw-bold">WRITE A COMMENT</strong>
                                        <button type="button" className="btn btn-primary" onClick={ openReview}>
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
                                                    const res = await postApi(config.LikeBlog, { article_id: id, user_id });
                                                    // backend returns { statusCode, action: 'liked' | 'unliked', likesCount }
                                                    if (res?.statusCode === 200) {
                                                        setHasLiked(res.action === 'liked');
                                                        setLikesCount(res.likesCount ?? likesCount);
                                                    } else {
                                                        // fallback: re-fetch if anything unexpected
                                                        // await fetchArticleDetails();
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

                        {/* Blog Right Section */}
                        <div className="col-lg-4">
                            <div className="featuredPosts">
                                <h6 className="mb-3 fw-semibold">Featured Post</h6>
                                <figure>
                                    <img
                                        // src="/images/landingpage/featured-postImg.jpg"
                                        src={`${process.env.NEXT_PUBLIC_API_URL}/${filteredblogs && filteredblogs.length > 0 ? filteredblogs[0]?.file : ''}`}
                                        alt=""
                                        className="featureImg"
                                    />
                                </figure>
                                <div className="healthHeading text-start mb-3">
                                    <h2 className="mb-1">{filteredblogs && filteredblogs.length > 0 ? filteredblogs[0]?.title : ""}</h2>
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html:
                                                (filteredblogs && filteredblogs.length > 0 ? filteredblogs[0]?.description : '')
                                                    .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
                                                    .slice(0, 30) + "...",
                                        }}
                                    ></span>
                                </div>

                                <hr />
                                <h6 className="mb-1 fw-semibold">Recent Posts</h6>
                                <ul className="recentUl">
                                    {recentblogs?.map((post, index) => (
                                        <li key={index} className="d-flex align-items-center gap-3" style={{ cursor: "pointer" }} onClick={() => handleNavigation(post._id)}>
                                            <figure className="m-0">
                                                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${post.file}`} alt="" />
                                            </figure>
                                            <div>
                                                <h6>{post.title}</h6>
                                                <a href="#">Learn More</a>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

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
            </section>
            <FooterSection />
            
        </>
    );
};

export default Blogs;
