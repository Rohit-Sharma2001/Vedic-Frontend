"use client";
import React, { useEffect, useState } from "react";
import { postApi } from "services/api";
import { useRouter } from 'next/navigation';
import { config } from "services/config";
import { Eye } from "react-bootstrap-icons";
import '../../public/css/style.css'
import Link from "next/link";

const stripHtml = (html) => {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const BlogBanner = () => {
   const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [pageconent, setPageContent] = useState([]);
  const [backgroundImage, setBackGroundImage] = useState(null);
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchBlogs(currentPage);
    fetchInitialData();
  }, [currentPage]);

  const fetchInitialData = async () => {
    try {
      const data = { id: "67bd8ab5732a78ad0c5e91bb" };
      const endpoint = config.ViewBlogPageContent;
      const response = await postApi(endpoint, data);
      console.log("response content", response.blogContantManagementData);

      if (response.statusCode === 201) {
        let imageUrl = response.blogContantManagementData.file
          ? `${process.env.NEXT_PUBLIC_API_URL}/${response.blogContantManagementData.file}`
          : null;

        if (imageUrl) {
          imageUrl = imageUrl.replace(/\\/g, "/");
        }

        setPageContent(response.blogContantManagementData);
        setBackGroundImage(imageUrl);
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const handleNavigation = (route) => {
    if (route) {
      router.push(`/LandingPage/components/BlogDetails/${route}`);
    }
  };

  const fetchBlogs = async (page) => {
    try {
      const endpoint = config.Blogs;
      const data = {};
      const response = await postApi(endpoint, data);

      const allBlogs = response.CenterManagementWithUrls || [];
      const activeBlogs = allBlogs.filter((blog) => blog.status === "Active");

      setPosts(activeBlogs.filter((blog) => blog.type === "post"));
      setArticles(activeBlogs.filter((blog) => blog.type === "article"));
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error("Error fetching blogs:", error);
    }
  };

  return (
    <section className="blogBanner">
      <div className="container">
        <div
          className="bgImage"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="innerbannerBlog">
            <span>{pageconent?.heading}</span>
            <h1>{pageconent?.subheading}</h1>
            <p dangerouslySetInnerHTML={{ __html: pageconent?.description }} />
            <div className="curvedArrow">
              <lottie-player
                src="/images/landingpage/curved-arrow.json"
                loop
                autoPlay
                style={{ width: "100px", height: "100px" }}
              ></lottie-player>
            </div>
          </div>
        </div>

        <div className="blogheading">
          <h2>Recent Posts</h2>
          <p>{pageconent?.post_text}</p>
        </div>

        <div className="row mb-5">
          {posts.map((post, index) => {
            const cleanText = stripHtml(post.description);
            const shortText = cleanText.length > 115 ? cleanText.slice(0, 115) + "..." : cleanText;
            return (
              <div key={`post-${index}`} className="col-md-4 col-lg-4 col-xl-3 mb-3 px-2">
                <div className="blogBox h-100" style={{ cursor: "pointer" }} onClick={() => handleNavigation(post._id)}>
                  <figure className="m-0">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${post.file}`}
                      alt={post.title}
                    />
                  </figure>
                  <div className="postContent">
                    <span><Eye style={{ marginRight: "3px" }} /> {post.viewCount}</span>
                    <h3>{post.title}</h3>
                    <p style={{ maxHeight: "100px", overflow: "hidden" }}>{shortText}</p>
                  </div>
                  <button className="btn btn-primary mt-auto">View</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="blogheading">
          <h2>Read our health articles</h2>
          <p>{pageconent?.articles_text}</p>
        </div>

        <div className="row mb-5">
          {articles.map((article, index) => {
            const cleanText = stripHtml(article.description);
            const shortText = cleanText.length > 115 ? cleanText.slice(0, 115) + "..." : cleanText;
            return (
              <div key={`article-${index}`} className="col-md-4 col-lg-4 col-xl-3 mb-3 px-2">
                <div className="blogBox h-100" style={{ cursor: "pointer" }} onClick={() => handleNavigation(article._id)}>
                  <figure className="m-0">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${article.file}`}
                      alt={article.title}
                    />
                  </figure>
                  <div className="postContent">
                    <Link href={`/LandingPage/components/BlogDetails/${article._id}`}>
                      <span><Eye style={{ marginRight: "3px" }} /> {article.viewCount}</span>
                    </Link>
                    <h3>{article.title}</h3>
                    <p style={{ maxHeight: "100px", overflow: "hidden" }}>{shortText}</p>
                  </div>
                                    <button className="btn btn-primary mt-auto">View</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BlogBanner;
