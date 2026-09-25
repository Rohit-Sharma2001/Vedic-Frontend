"use client";
import React, { useEffect, useState } from "react";
import Header from "../Header/page";
// import SubHeader from "../SubHeader/page";
import InnerBanner from "../AmitajainInnerBanner/page";
import AboutAmitaJain from "../AboutAmitaJain/page";
import ContactAmita from "../ContactAmita/page";
import BackgroundOfHer from "../BackgroundOfHer/page";
import SendANoteToAmita from "../SendANoteToAmita/page";
import { Modal, Button, Form } from "react-bootstrap";
import Link from "node_modules/next/link";
import BhagavadGitaQuote from "../BhagavadGitaQuote/page";
import FooterSection from "../Footer/page";
import { postApi, updateApiWithFile } from "services/api";
import { config } from "services/config";
import { checkIsOwner } from "services/config";
import '../../public/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AmitaJainQuote from "../../AmitaJainQuote/page";
import { usePathname } from 'next/navigation';
const AmitaJainLandingPage = () => {
  const [pageTitle, setPageTitle] = useState("Gallery");
  const [pageSubtitle, setPageSubtitle] = useState("Recent glimpses from our sessions");
  const [showArticleModal, setShowArticleModal] = useState(false);
 const [itemTypeList, setItemTypeList] = useState([]);

     const [isOwner, setIsOwner] = useState(false);
       const [articles, setArticles] = useState([]);
        const [currentPage, setCurrentPage] = useState(1);
         const [pageSize, setPageSize] = useState(10);
         const [totalPages, setTotalPages] = useState(1);
 const [articleSection, setArticleSection] = useState({
    articleSectionHeading: "",
    articleSectionText: "",
  });



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
     
    } catch (error) {
      console.error("Error fetching gallery header:", error);
    } finally {
      
    }
  };
  
  useEffect(() => {
    fetchGalleryHeader();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { fetchItemTypes(currentPage); }, [currentPage]);

    const fetchItemTypes = async (page) => {
        try {
            const endpoint = config.category;
            const data = { dropdown_type: "gallery_images", page, pageSize };
            const response = await postApi(endpoint, data);
            setItemTypeList(response.result || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) { console.error('Error fetching product types:', error); }
    };
const handleSaveArticleSection = async () => {
  try {
    const id = "682d6732463d1cd07ffc9a73"; // same ID you used in fetchProjectData
    const payload = { ...articleSection };

    const res = await updateApiWithFile(config.UpdateProjectDetails, id, payload, {});
    if (res?.statusCode === 200 || res?.statusCode === 201) {
      console.log("Article Section updated successfully");
      setShowArticleModal(false);
      fetchProjectData(); // refresh data
    }
  } catch (err) {
    console.error("Error saving article section", err);
  }
};




    useEffect(() => {
      fetchArticles(currentPage);
    }, [currentPage]);
  
    const fetchArticles = async (page) => {
      try {
        const endpoint = config.Articles;
        const data = { page, pageSize };
        const response = await postApi(endpoint, data);
        console.log("Articles", response);
        setArticles(response.resultWithUrls || []);
        setTotalPages(response.totalPages || 1);
      } catch (error) {
        console.error("Error fetching articles:", error);
      }
    };
    const fetchProjectData = async () => {
      try {
        const res = await postApi(config.GetProjectDetails, {
          id: "682d6732463d1cd07ffc9a73",
        });
        const data = res?.result;
        if (data) {
          
          setArticleSection({
            articleSectionHeading: data.articleSectionHeading || "",
            articleSectionText: data.articleSectionText || "",
          });
         }
      } catch (err) {
        console.error("Error fetching project data", err);
      }
    };
 
  const pathname = usePathname();

useEffect(() => {
   fetchProjectData()
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  } 
}, [pathname]);

    const [data, setData] = useState([]);
    const [imagepreview, setImagePreview] = useState(null);
    const [quoteimagepreview, setQuoteImagePreview] = useState(null);
    const [careerimagepreview, setCareerImagePreview] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top when the page loads
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const endpoint = config.AboutAmita;
            const response = await postApi(endpoint, {});
            console.log("Amita Jain Response:", response);
            
            if (response.statusCode === 201) {
                setData(response.coupon);
                setImagePreview(response.coupon.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.coupon.file}`.replace(/\\/g, "/") : null);
                setQuoteImagePreview(response.coupon.quote_image ? `${process.env.NEXT_PUBLIC_API_URL}/${response.coupon.quote_image}`.replace(/\\/g, "/") : null);
                setCareerImagePreview(response.coupon.career_image ? `${process.env.NEXT_PUBLIC_API_URL}/${response.coupon.career_image}`.replace(/\\/g, "/") : null);
            }
        } catch (error) {
            console.error('Error fetching initial data:', error);
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
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Amita Jain Landing Page </h3>
    }
            {/* {!isOwner && <SubHeader />} */}
            <InnerBanner  />
            <div id="about">
                <AboutAmitaJain />
            </div>
            <div id="background">
                <BackgroundOfHer data={data} />
            </div>
           
{/* ********************************************************************* Articles Section ********************************************         */}
             {isOwner &&
                       <div className="d-flex gap-3"> <Button
                          onClick={() => setShowArticleModal(true)}
                          className="btn btn-outline-info mt-2"
                        >
                          ✏️ Edit Article Section
                        </Button>
                         <Link href={'/admin/Article-Management/Articles'} target="_parent" className="btn btn-primary mt-2 ml-3">✏️ Manage Articles Data </Link>
            </div>}
            <section id="articles" className="articlesAbout">
        <div className="container-fluid">
            <div className="d-flex align-items-end justify-content-between mb-4">
                <div className="section-heading text-start ms-0 mw-100 p-0">
                    <img src="/images/landingpage/watermark.png" width="50"/>
                    <h2> {articleSection?.articleSectionHeading} </h2>
                    <p>{articleSection?.articleSectionText}</p>
                </div>
                <Link href={'/LandingPage/components/BookArticles'} className="btn btn-primary">View All</Link>
            </div>
            <div className="row mb-md-5 mb-2">
                 {articles.slice(0, 3).map((article, index) => (
                <div key={index} className="col-md-4 col-lg-4 col-xl-4 mb-3 px-2">
                    <div className="articlesBx h-100">
                        <Link href={`/LandingPage/components/ArticleDetails/${article._id}`} style={{cursor:'pointer'}}> 
                        <figure className="m-0 position-relative">
                            <img  src={`${process.env.NEXT_PUBLIC_API_URL}/${article.file}`} alt=""/>
                            <span><i className="bi bi-eye"></i> {article.viewCount || 0}</span>
                        </figure>
                        </Link>
                        <div className="postContent">
                            <h3>{article.title}</h3>
                            <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
                                <b>
                                    <img  src={`${process.env.NEXT_PUBLIC_API_URL}/${article.image}`} alt="" className="me-2"/> {article.auther_name}
                                </b>
                                <div className="d-flex align-items-center gap-3">
                                    {/* <a href=""><img src="/images/landingpage/saved-icon.svg" alt="" width="30"/></a> */}
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
                        </div>
                    </div>
                </div>
                 ))}
               
            </div>
        </div>
    </section>



    {/* ***************************************************************Video Sections**************************************** */}

 


 <section className="gallerySection">
        <div className="container-fluid">
           {isOwner &&
           
             <Link href={'/admin/Master/GalleryImages'} target="_parent" className="btn btn-primary mt-2 ml-3">Manage Gallery</Link>}
          <div className="section-heading text-start ms-0">
            <img src="/images/landingpage/watermark.png" width="50" />
            <h2>{pageTitle ? pageTitle : "Gallery"}</h2>
                <p>{pageSubtitle ? pageSubtitle : "Recent glimpses from our sessions"}</p>
          </div>
          <div className="row px-1">
            <div className="col-6 col-md-4 px-2 mb-3">
              <figure className="mb-0">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${itemTypeList[0]?.file}`} alt="" />
              </figure>
            </div>
            <div className="col-6 col-md-3 px-2 mb-3">
              <figure className="mb-0">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${itemTypeList[1]?.file}`} alt="" />
              </figure>
            </div>
            <div className="col-6 col-md-5 px-2 mb-3">
              <figure className="mb-0">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${itemTypeList[2]?.file}`} alt="" />
              </figure>
            </div>
            <div className="col-6 col-md-5 px-2 mb-3">
              <figure className="mb-0">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${itemTypeList[3]?.file}`} alt="" />
              </figure>
            </div>
            <div className="col-6 col-md-4 px-2 mb-3">
              <figure className="mb-0">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${itemTypeList[4]?.file}`} alt="" />
              </figure>
            </div>
            <div className="col-6 col-md-3 px-2 mb-3">
              <figure className="mb-0 moreImg position-relative">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${itemTypeList[5]?.file}`} alt="" />
                <Link href={'/LandingPage/components/Gallery'} style={{textDecoration:'none'}} className="moreImgTag">
                  5+ more
                </Link>
              </figure>
            </div>
          </div>
        </div>
      </section>


{/* <AmitaJainQuote/> */}

 {!isOwner && <ContactAmita />}
    
          {!isOwner &&   <FooterSection />}

          <Modal show={showArticleModal} size="lg" onHide={() => setShowArticleModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Article Section</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form>
      <Form.Group controlId="formArticleHeading" className="mb-3">
        <Form.Label>Heading</Form.Label>
        <Form.Control
          type="text"
          value={articleSection.articleSectionHeading}
          onChange={(e) =>
            setArticleSection({ ...articleSection, articleSectionHeading: e.target.value })
          }
        />
      </Form.Group>
      <Form.Group controlId="formArticleText" className="mb-3">
        <Form.Label>Text</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={articleSection.articleSectionText}
          onChange={(e) =>
            setArticleSection({ ...articleSection, articleSectionText: e.target.value })
          }
        />
      </Form.Group>
    </Form>
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowArticleModal(false)}>
      Cancel
    </Button>
    <Button variant="primary" onClick={handleSaveArticleSection}>
      Save Changes
    </Button>
  </Modal.Footer>
</Modal>

        </>
    );
};

export default AmitaJainLandingPage;
