"use client";
import React, { useEffect, useState } from "react";
import Header from "../Header/page";
// import SubHeader from "../SubHeader/page";
import InnerBanner from "../AmitajainInnerBanner/page";
import AboutAmitaJain from "../AboutAmitaJain/page";
import BackgroundOfHer from "../BackgroundOfHer/page";
import SendANoteToAmita from "../SendANoteToAmita/page";
import BhagavadGitaQuote from "../BhagavadGitaQuote/page";
import FooterSection from "../Footer/page";
import Link from "node_modules/next/link";
import { postApi } from "services/api";
import { config } from "services/config";
import "../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';

const BookArticles = () => {
   const [isOwner, setIsOwner] = useState(false);
const [activeTab, setActiveTab] = useState("all");

const pathname = usePathname();

useEffect(() => {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);
  const [formData, setFormData] = useState({
    heading: "",
    sub_heading: "",
    article_text: "",
    article_description: "",
    book_text: "",
    book_description: "",
  });
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [itemTypeList, setItemTypeList] = useState([]);
  // feedback message for fallback (optional)
const [shareMsg, setShareMsg] = useState("");

// build article URL
const getArticleUrl = (id) =>
  `${window.location.origin}/LandingPage/components/ArticleDetails/${id}`;

// unified share handler
const handleShare = async (article) => {
  const url = getArticleUrl(article._id);
  const title = article?.title || "Article";
  const text = article?.auther_name
    ? `${article.auther_name} — ${title}`
    : title;

  try {
    // Use native share if supported (mobile & some desktops)
    if (navigator.share && typeof navigator.share === "function") {
      await navigator.share({ title, text, url });
      return;
    }

    // Fallback: copy link
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      setShareMsg("Link copied to clipboard");
      setTimeout(() => setShareMsg(""), 2000);
      return;
    }

    // Last resort: prompt
    window.prompt("Copy this link:", url);
  } catch (err) {
    // user cancelled or share failed → fallback to copy
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg("Link copied to clipboard");
      setTimeout(() => setShareMsg(""), 2000);
    } catch (_) {
      window.prompt("Copy this link:", url);
    }
  }
};

  const fetchArticles = async (page) => {
    try {
      const endpoint = config.Articles;
      const data = { page, pageSize };
      const response = await postApi(endpoint, data);
      console.log(response);
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

  const fetchInitialData = async () => {
    try {
      const data = { id: "682afe850640a2bf4cf74479" };
      const endpoint = config.ViewArticlePageContent;
      const response = await postApi(endpoint, data);
      console.log(response);
      if (response.statusCode === 201) {
        setFormData({
          heading: response.result.heading || "",
          sub_heading: response.result.sub_heading || "",
          article_text: response.result.article_text || "",
          article_description: response.result.article_description || "",
          book_text: response.result.book_text || "",
          book_description: response.result.book_description || "",
        });
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when the page loads
    fetchInitialData();
    fetchArticles(currentPage);
    fetchItemTypes(currentPage);
  }, []);

  const fetchItemTypes = async (page) => {
    try {
      const endpoint = config.category;
      const data = { dropdown_type: "book", page, pageSize };
      const response = await postApi(endpoint, data);
      setItemTypeList(response.result || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching product types:", error);
    }
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


  return (
    <>
      {/* <Header arrayheader={arrayheader} /> */}
        {!isOwner ?
      <Header arrayheader={arrayheader} />
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Your Doshas Page</h3>
    }
  {/* {!isOwner && <SubHeader />} */}
      <section className="blogBanner">
        <div className="container">
          <div className="d-md-flex justify-content-between align-items-center">
            <div className="d-md-flex justify-content-between align-items-center">
              <div className="section-heading text-start ms-0 mw-100">
                 {isOwner &&<>
                 <div className="d-flex gap-3">
                 <Link href={'/admin/Article-Management'} target="_parent" className="btn btn-primary mr-3">✏️ edit page details </Link>
                 <Link href={'/admin/Article-Management/Articles'} target="_parent" className="btn btn-primary mr-3"><b>+</b> Add Articles </Link>
                 <Link href={'/admin/Master/Books'} target="_parent" className="btn btn-primary"><b>+</b> Add Books </Link>
                 </div>
                 </>}
                <img src="/images/landingpage/watermark.png" width={50} />
                <h2>{formData?.heading}</h2>
                <p>{formData?.sub_heading}</p>
              </div>
            </div>
            <div className="">
              <ul className="nav nav-tabs ordersTabs">
                <li className="nav-item">
                 <button
  className={`nav-link ${activeTab === "all" ? "active" : ""}`}
  onClick={() => setActiveTab("all")}
  type="button"
>
  All
</button>
                </li>
                <li className="nav-item">
                 <button
  className={`nav-link ${activeTab === "articles" ? "active" : ""}`}
  onClick={() => setActiveTab("articles")}
  type="button"
>
  Articles
</button>
                </li>
                <li className="nav-item">
                  <button
  className={`nav-link ${activeTab === "books" ? "active" : ""}`}
  onClick={() => setActiveTab("books")}
  type="button"
>
  Books
</button>
                </li>
              </ul>
            </div>
          </div>
          <div className="tab-content">
            {activeTab === "all" && (
            <div >
              <div className="blogheading">
                <h2 className="text-brown">{formData?.article_text}</h2>

                <p
                  dangerouslySetInnerHTML={{
                    __html: formData?.article_description,
                  }}
                />
              </div>
              <div className="row mb-5">
                {articles?.map((article, index) => (
                  <div 
                    className="col-md-4 col-lg-4 col-xl-4 mb-3 px-2"
                    key={index}
                  >
                    <div className="articlesBx h-100">
                      <Link href={`/LandingPage/components/ArticleDetails/${article._id}`}> 
                      <figure className="m-0 position-relative">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/${article.file}`}
                          alt=""
                         
                        />
                        <span>
                          <i className="bi bi-eye" style={{marginRight:'3px'}} />
                          {article.viewCount || 0}
                        </span>
                      </figure>
                      </Link>
                      <div className="postContent">
                        <h3>{article.title}</h3>
                        <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                          <b>
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}/${article.image}`}
                              alt=""
                              className="me-2"
                            />{" "}
                            {article.auther_name}
                          </b>
                         <div className="d-flex align-items-center gap-3">
  <button
  type="button"
  onClick={() => handleShare(article)}
  style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
  aria-label="Share article"
  title="Share"
>
  <img
    src="/images/landingpage/forword-icon.svg"
    alt="Share"
    width={30}
  />
</button>

</div>

                        </div>
                        <p>Posted on: {new Date(article.date).toLocaleDateString("en-US")}</p>
                      </div>
                    </div>
                  </div>

                ))}
              </div>
              
              <div className="blogheading">
                <h2 className="text-brown">{formData?.book_text}</h2>

                <p
                  dangerouslySetInnerHTML={{
                    __html: formData?.book_description,
                  }}
                />
              </div>
              <div className="row mb-md-5">
                {itemTypeList?.map((item, index) => (
                  <div key={index} onClick={()=>{const url = item?.address?.startsWith("http")
                      ? item?.address : `https://${item.address}`;
                    window.open(url, "_blank", "noopener,noreferrer");}} 
                      className="col-md-4 col-lg-4 col-xl-3 mb-3 px-3"
                      style={{ cursor:  "pointer" }}>
                    <div className="booksBx h-100">
                      <figure className="m-0 text-center">
                        <img
                           src={`${process.env.NEXT_PUBLIC_API_URL}/${item.file}`}
                          alt={item?.name}
                        />
                      </figure>
                      <div className="postContent ps-3 mt-4">
                        <h3>{item?.name}</h3>
                        <p>Published By: {item?.description}</p>
                        <p>{item?.instructor_title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>)}
            {activeTab === "articles" && (
            <div >
             <div className="blogheading">
                <h2 className="text-brown">{formData?.article_text}</h2>

                <p
                  dangerouslySetInnerHTML={{
                    __html: formData?.article_description,
                  }}
                />
              </div>
              <div className="row mb-5">
                {articles?.map((article, index) => (
                  <div 
                    className="col-md-4 col-lg-4 col-xl-4 mb-3 px-2"
                    key={index}
                  >
                    <div className="articlesBx h-100">
                      <Link href={`/LandingPage/components/ArticleDetails/${article._id}`}> 
                      <figure className="m-0 position-relative">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/${article.file}`}
                          alt=""
                        />
                        <span>
                          <i className="bi bi-eye" style={{marginRight:'3px'}} />
                          {article.viewCount || 0}
                        </span>
                      </figure>
                      </Link>
                      <div className="postContent">
                        <h3>{article.title}</h3>
                        <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                          <b>
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}/${article.image}`}
                              alt=""
                              className="me-2"
                            />{" "}
                            {article.auther_name}
                          </b>
                         <div className="d-flex align-items-center gap-3">
  <button
    onClick={() => {
      const articleUrl = `${window.location.origin}/LandingPage/components/ArticleDetails/${article._id}`;
      navigator.clipboard.writeText(articleUrl)
        .then(() => {
          alert("Link copied to clipboard!");
        })
        .catch(err => {
          console.error("Failed to copy: ", err);
        });
    }}
    style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
  >
    <img
      src="/images/landingpage/forword-icon.svg"
      alt="Copy Link"
      width={30}
    />
  </button>
</div>

                        </div>
                        <p>Posted on: {new Date(article.date).toLocaleDateString("en-US")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>)}
            {activeTab === "books" && (
            <div >
              <div className="blogheading">
                <h2 className="text-brown">{formData?.book_text}</h2>

                <p
                  dangerouslySetInnerHTML={{
                    __html: formData?.book_description,
                  }}
                />
              </div>
              <div className="row mb-md-5">
                {itemTypeList?.map((item, index) => (
                  <div key={index} onClick={()=>{
                    if (!item?.address) return;
                    const url = item?.address?.startsWith("http")
                      ? item?.address : `https://${item?.address}`;
                    window.open(url, "_blank", "noopener,noreferrer");}} 
                    className="col-md-4 col-lg-4 col-xl-3 mb-3 px-3"
                    style={{
    cursor:  "pointer" ,
  }}>
                    <div className="booksBx h-100">
                      <figure className="m-0 text-center">
                        <img
                           src={`${process.env.NEXT_PUBLIC_API_URL}/${item.file}`}
                          alt={item?.name}
                        />
                      </figure>
                      <div className="postContent ps-3 mt-4">
                        <h3>{item?.name}</h3>
                        <p>Published By: {item?.description}</p>
                        <p>{item?.instructor_title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>)}
          </div>
        </div>
      </section>

    {!isOwner &&   <FooterSection />}
    </>
  );
};

export default BookArticles;
