"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
// import SubHeader from "../../SubHeader/page";
import Header from "../../Header/page";
import "../../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { config } from "services/config";
import { postApi } from "services/api";
import FooterSection from "../../Footer/page";
const CaseStories = ({ params }) => {
  const id = params.caseid;
  const [featuredPost, setFeaturedPost] = useState(null);
const router = useRouter();
  const [formData, setFormData] = useState({});
  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  const GetCaseStories = async (page) => {
    try {
      const endpoint = config.GetCaseStories;
      const data = { page, pageSize };
      const response = await postApi(endpoint, data);
const results = (response.result || []).sort(
  (a, b) => new Date(b.date) - new Date(a.date)
);

setArticles(results);

      setTotalPages(response.totalPages || 1);

      // Find the first featured post
      const featured = results.find((item) => item.is_featured === 1);
      setFeaturedPost(featured || null);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };

  useEffect(() => {
    GetCaseStories(currentPage);
    if (id) fetchCaseStoryDetails();
  }, [id]);

  const fetchCaseStoryDetails = async () => {
    try {
      const endpoint = config.ViewCaseStory;
      const data = { id: id };
      const response = await postApi(endpoint, data);
console.log("response",response)
      if (response.statusCode === 201) {
        const article = response.result[0];
        setFormData(article);
        updateCaseStoryViewCount(id);
      }
    } catch (error) {
      console.error("Error fetching article details:", error);
    }
  };

  const updateCaseStoryViewCount = async (id) => {
    try {
      const endpoint = config.UpdateCaseStory;
      const updateData = {
        id: id,
      };
      const files = {};

      const response = await postApi(endpoint, updateData);
      //  const response = await updateApiWithFile(endpoint, id, updateData, files);
      if (response.statusCode === 200) {
        console.log("View count updated for case story.");
      } else {
        console.error("Failed to update case story view count.");
      }
    } catch (error) {
      console.error("Error updating case story view count:", error);
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
      <Header arrayheader={arrayheader} />
        {/* <SubHeader /> */}
      <section className="blogBanner mb-md-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="blogLeft">
                <figure>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${formData?.image}`}
                    alt=""
                    className="blogfirstImg"
                  />
                </figure>
                <div className="healthHeading mb-3">
                  <h2 className=" mb-2">Vedic Health</h2>
                  <span>{formData?.title}</span>
                </div>
                {/* <p>Yoga transmutes animal nature into divine nature and raises a sadhaka to the heights of
                            divine glory and splendor. To come out of lust for power, material greed, sensual pleasure,
                            selfishness, passion for wealth and all materialistic desires is possible, if one practices
                            the very principles of Yoga in the right earnest.</p> */}
                <div className="blogContent text-black">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: formData?.descriptions,
                    }}
                  />
                </div>
                   <div className="editor">
                            <figure className="m-0">
                                <img  src={`${process.env.NEXT_PUBLIC_API_URL}/${formData?.file}`} alt=""/>
                            </figure>
                            <div>
                                <h6>{formData?.author_name}, <span> ({formData?.author_designation})</span></h6>
                                <div
                                  className="blogContent"
                                  dangerouslySetInnerHTML={{
                                    __html: formData?.author_description,
                                  }}
                                />
                            </div>
                        </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="featuredPosts">
                {featuredPost && (
                  <>
                    <h6 className="mb-3 fw-semibold">Featured Post</h6>
<div
  onClick={() =>
    router.push(`/LandingPage/components/CaseStoriesDetails/${featuredPost?._id}`)
  }
  style={{ cursor: "pointer" }}
>
  <figure>
    <img
      src={`${process.env.NEXT_PUBLIC_API_URL}/${featuredPost.image}`}
      alt=""
      className="featureImg"
    />
  </figure>
</div>

                    <div className="healthHeading text-start mb-3">
                      <h2 className="mb-1">Vedic Health</h2>
                      <span>{featuredPost.title}</span>
                    </div>
                  </>
                )}

                <h6 className="mb-1 fw-semibold">Recent Posts</h6>
                <ul className="recentUl">
                  {articles?.map((item, index) => (
                    <li className="d-flex align-items-center gap-3" key={index}>
                      <figure className="m-0">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/${item?.image}`}
                          alt=""
                        />
                      </figure>
                      <div className="">
                        <h6>{item?.title}</h6>
                        <Link
                          href={`/LandingPage/components/CaseStoriesDetails/${item._id}`}
                        >
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
      <FooterSection/>
    </>
  );
};
export default CaseStories;
