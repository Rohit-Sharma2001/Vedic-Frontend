"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../Header/page";
// import SubHeader from "../SubHeader/page";
import "../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { config } from "services/config";
import { postApi } from "services/api";
import { checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';
import FooterSection from "../Footer/page";

const CaseStories = ({ params }) => {
  const id = params.articleid;
  const [formData, setFormData] = useState({
    id: id,
    title: "",
    descriptions: "",
    auther_name: "",
    image: null,
    file: null,
  });
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [caseStoryList, setCaseStoryList] = useState([]);
  const [caseStories, setCaseStories] = useState([]);
 const [isOwner, setIsOwner] = useState(false);
 const [searchTerm, setSearchTerm] = useState("");


const pathname = usePathname();

useEffect(() => {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);
  useEffect(() => {
    fetchCaseStoriestype(currentPage);
    fetchCaseStories(currentPage);
  }, [currentPage]);

  const fetchCaseStoriestype = async (page) => {
    try {
      const endpoint = config.GetDropdownCaseStoryType;
      const data = {};
      const response = await postApi(endpoint, data);
      console.log("drope", response);
      setCaseStoryList(response.result || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Error fetching case stories:", error);
    }
  };

 const fetchCaseStories = async (page) => {
  try {
    const response = await postApi(config.GetCaseStories, { page, pageSize });
    console.log("cases", response);

    const sortedStories = (response.result || []).sort(
      (a, b) => (b.viewCount || 0) - (a.viewCount || 0)
    );

    setCaseStories(sortedStories);
    setTotalPages(response.totalPages || 1);
  } catch (error) {
    console.error("Error fetching case stories:", error);
  }
};


  const fetchArticleDetails = async () => {
    try {
      const endpoint = config.ViewArticles;
      const data = { id: id };
      const response = await postApi(endpoint, data);
      console.log(response);
      if (response.statusCode === 201) {
        const article = response.result;
        setFormData(article);
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
    }
  };
  const filteredStories = caseStories.filter((story) => {
  const title = story.title?.toLowerCase() || "";
  const description = story.descriptions?.toLowerCase() || "";
  const term = searchTerm.toLowerCase();

  return title.includes(term) || description.includes(term);
});

  const arrayheader = [
    { name: "Schedule", route: "/LandingPage/components/AmitaHome" },
    { name: "Free Clinic", route: "/LandingPage/components/FreeClinic" },
    { name: "Classes", route: "/YogaClasses/components/JoinYogaClasses" },
    { name: "Book & Articles", route: "/LandingPage/components/BookArticles" },
    { name: "Talks", route: "/LandingPage/components/TalksByAmita" },
    { name: "Case Studies", route: "/LandingPage/components/CaseStories" },
    { name: "About", route: "/LandingPage/components/AmitajainLandingPage" },
  ];

  const stripHtml = (html) => {
  if (!html) return "";
  const temp = document.createElement("div");
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || "";
};

const getShortDescription = (html, maxWords = 200) => {
  const text = stripHtml(html);
  const words = text.split(/\s+/);

  if (words.length <= maxWords) return { short: text, isTruncated: false };

  return {
    short: words.slice(0, maxWords).join(" "),
    isTruncated: true
  };
};



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
              <div className="section-heading text-start ms-0 mw-100 pb-4">
                  {isOwner &&<>
                 <div className="d-flex gap-3">
                 {/* <Link href={'/admin/Article-Management'} className="btn btn-primary mr-3">✏️ edit page details </Link> */}
                 <Link href={'/admin/Master/CaseStoriesType'}   target="_parent"  className="btn btn-primary mr-3"><b>+</b> Add Case Studies Type </Link>
                <Link 
  href="/admin/Master/CaseStories" 
  target="_parent" 
  className="btn btn-primary"
>
  + Add Case Study
</Link>

                 </div>
                 </>}
                <img src="/images/landingpage/watermark.png" width="50" />
                <h2 >Case Studies</h2>
                <p>Lorem Ipsum Simply Dummy Text for typesetting industry</p>
              </div>
            </div>
            <div className="lectureInpt">
            <input
  type="text"
  className="form-control"
  placeholder="Search"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>

            </div>
          </div>
          
          <div className="row mb-5">
       {
  filteredStories?.map((story, index) => {
    const desc = getShortDescription(story.descriptions, 30); // ✅ Moved OUTSIDE JSX

    return (
      <div
        className="col-md-12 col-lg-6 col-xl-6 mb-3 px-2"
        key={index}
      >
        <div className="lectureBx p-2">
          <Link href={`/LandingPage/components/CaseStoriesDetails/${story._id}`}>
            <figure className="m-0 position-relative">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/${story.image}`}
                alt={story.title}
              />
              <span>
                <i className="bi bi-eye"></i> {story?.viewCount || 0}
              </span>
            </figure>
          </Link>

          <div className="lectureContent">
            <h3 className="text-black">{story?.title}</h3>

            <p className="text-black">
              {desc.short}
              {desc.isTruncated && (
                <>
                  ...{" "}
                  <Link href={`/LandingPage/components/CaseStoriesDetails/${story._id}`}>
                    Read More
                  </Link>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    );
  })
}

          </div>
          {caseStoryList.map((type) => {
          const storiesOfType = filteredStories.filter(
  (story) => story.case_story_type_id === type._id
);

            return (
              <div key={type._id} className="mb-5">
                <div className="blogheading">
                  <h2>{type.name}</h2>
                  <p>{type.description}</p>
                </div>

                <div className="row">
                  {storiesOfType.length > 0 ? (
                    storiesOfType.map((story) => (
                      <div
                        key={story._id}
                        className="col-md-12 col-lg-6 col-xl-6 mb-3 px-2"
                      >
                        <div className="lectureBx p-2">
                             <Link href={`/LandingPage/components/CaseStoriesDetails/${story._id}`} >
                          <figure className="m-0 position-relative">
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL}/${story.image}`}
                              alt={story.title}
                            />
                            <span>
                              <i className="bi bi-eye"></i>{" "}
                              {story.viewCount || 0}
                            </span>
                          </figure>
                          </Link>
                          <div className="lectureContent">
                            <h3 className="text-black">{story.title}</h3>
                            {/* <p className="text-black">{story.descriptions?.substring(0, 150)}...</p> */}
                            <p
                              className="text-black"
                              dangerouslySetInnerHTML={{
                                __html: story.descriptions?.substring(0, 150),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-12">
                      <p>No studies found for this category.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
      {!isOwner && <FooterSection/>}
    </>
  );
};
export default CaseStories;
