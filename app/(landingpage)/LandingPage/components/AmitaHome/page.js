"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../Header/page";
import FooterSection from "../Footer/page";
// import SubHeader from "../SubHeader/page";
import "../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
import { Modal, Button, Form } from "react-bootstrap";
import { Trash } from "react-bootstrap-icons";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import dynamic from "next/dynamic";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";
import { checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';
import Schedule from "../Schedule/page";
const AmitaJainHomePage = () => {
  const [participationForm, setParticipationForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    dob: "",
    homeAddress: "",
    cardNumber: "",
    cardLocation: "",
  });

  const isNonEmpty = (s) => String(s || "").trim().length > 0;
  const isEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e || "").trim());
  const isPhone = (n) => /^\d{10,}$/.test(String(n || "").replace(/\D/g, ""));



  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    mobile: '',
    message: ''
  });
  const isContactFormValid =
    isNonEmpty(formData.firstName) &&
    isNonEmpty(formData.lastName) &&
    isEmail(formData.email) &&
    isPhone(formData.mobile) &&
    isNonEmpty(formData.message);
  const [successMessage, setSuccessMessage] = useState('');
  const [isOwner, setIsOwner] = useState(false);

  const pathname = usePathname();

  const handleParticipationChange = (e) => {
    const { name, value } = e.target;
    setParticipationForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ US Phone Number Validation (10-digit, optional +1)
  const isValidUSPhoneNumber = (number) => {
    const cleaned = number.replace(/\D/g, ""); // remove non-digits
    return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith("1"));
  };

  const handleParticipationSubmit = async (e) => {
    e.preventDefault();

    // ✅ Phone validation
    if (!isValidUSPhoneNumber(participationForm.phoneNumber)) {

      return;
    }
    try {
      const endpoint = config.AddParticipation; // 👈 API endpoint
      const response = await postApi(endpoint, participationForm);

      if (response.statusCode === 201 || response.statusCode === 200) {
        alert("Participation form submitted successfully! ✅");

        // Reset form
        setParticipationForm({
          firstName: "",
          lastName: "",
          email: "",
          phoneNumber: "",
          dob: "",
          homeAddress: "",
          cardNumber: "",
          cardLocation: "",
        });

        // ✅ Close the modal using Bootstrap API
        const modalEl = document.getElementById("participForm");
        const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
        if (modalInstance) {
          modalInstance.hide();
        }
      } else {
        alert("Failed to submit participation form!");
      }
    } catch (error) {
      console.error("Error submitting participation form:", error);
      alert("Something went wrong!");
    }
  };

  useEffect(() => {
    const isIframe = typeof window !== "undefined" && window.self !== window.top;
    const isAdminPath = pathname?.includes('/admin');
    const isAdminUser = checkIsOwner();

    if (isAdminUser && (isIframe || isAdminPath)) {
      setIsOwner(true);
    }
  }, [pathname]);
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const [articles, setArticles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectData, setProjectData] = useState({
    name: "",
    text: "",
    subText: "",
    project_name:"",
    signup_button_label:"",
    project_text:"",
    project_name: "",
    project_text: "",
    description: "",
    file: null,        // File object only when user selects a new image
    fileUrl: "",
    additionalImages: [],
    facilities: "",
  });
  // Add state for about project modal
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [aboutProject, setAboutProject] = useState({
    aboutProjectHeading: "",
    aboutProjectDescription: "",
  });
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
const [pagevideoTitle, setPageVideoTitle] = useState("Gallery ( Videos )");
const [pagevideoSubtitle, setPageVideoSubTitle] = useState("Watch our latest clips");
  // New state for generic section modal
  const [showGenericSectionModal, setShowGenericSectionModal] = useState(false);
  const [genericSection, setGenericSection] = useState({
    section_heading: "",
    section_text: "",
  });

  // State for industry section modal
  const [showIndustryModal, setShowIndustryModal] = useState(false);
  const [industrySection, setIndustrySection] = useState({
    industrySectionHeading: "",
    industrySectionText: "",
    industrySectionContent: "",
    image: null,
  });

  const [videos, setVideos] = useState([]);
  const videoSliderRef = useRef(null);
  const industryImageRef = useRef(null);
  const [industryPreview, setIndustryPreview] = useState(null);
  const [projectsections, setProjectSections] = useState([]);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [articleSection, setArticleSection] = useState({
    articleSectionHeading: "",
    articleSectionText: "",
  });
  const [showGallaryVideoModel,setShowGallaryVideoModel] = useState(false)
  const [gallaryVideo,setGallaryVideo]=useState(false)
  // Fetch project data on modal open
  useEffect(() => {
    fetchProjectData();
    fetchData();
  }, []);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const endpoint = config.category;
      const data = { dropdown_type: "gallery_videos", page: 1, pageSize: 50 }; // Fetch more videos
      const response = await postApi(endpoint, data);
      setVideos(response.result || []);
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
  };

  // Video Gallery Slider Navigation Functions
  const goToNextVideo = () => {
    videoSliderRef.current?.slickNext();
  };

  const goToPrevVideo = () => {
    videoSliderRef.current?.slickPrev();
  };

  // Video Gallery Slider Settings
  const videoSliderSettings = {
    dots: false,
    infinite: false,
    arrows: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    responsive: [
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          dots: true,
        },
      },
    ],
  };
  const fetchData = async () => {
    try {
      const res = await postApi(config.GetProjectSections, {});
      console.log("projec sections", res);
      setProjectSections(res.resultWithUrls || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    if (!isContactFormValid) return; // safety net
    try {
      const endpoint = config.AddNotes;
      const data = { ...formData };
      const response = await postApi(endpoint, data);
      if (response.statusCode === 201 || response.statusCode === 200) {
        setSuccessMessage("Your note has been sent successfully! ✅");
        ResetForm();
      } else {
        alert("Failed to send the note!");
      }
    } catch (error) {
      console.error("Error sending the note:", error);
    }
  };


  const ResetForm = () => {
    setFormData({
      email: "",
      message: "",
      firstName: "",
      lastName: "",
      mobile: ""
    });
  };

  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage]);

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
  const fetchProjectData = async () => {
    try {
      const res = await postApi(config.GetProjectDetails, {
        id: "682d6732463d1cd07ffc9a73",
      });
      const data = res?.result;
      if (data) {
        setProjectData({
          name: data.name || "",
          text: data.text || "",
          subText: data.subText || "",
          project_name:data.project_name || "",
          signup_button_label:data.signup_button_label || "",
          project_text:data.project_text || "",
          project_name: data.project_name || "",
          project_text: data.project_text || "",
          description: data.description || "",
          file: null, // keep null until user selects a new one
          fileUrl: (data.file || "").replace(/\\/g, "/"),
          additionalImages: data.additionalImages || [],
          facilities: data.facilities || "",
        });
        setAboutProject({
          aboutProjectHeading: data.aboutProjectHeading || "",
          aboutProjectDescription: data.aboutProjectDescription || "",
        });
        setIndustrySection({
          industrySectionHeading: data.industrySectionHeading || "",
          industrySectionText: data.industrySectionText || "",
          industrySectionContent: data.industrySectionContent || "",
          image: null,
        });
        setArticleSection({
          articleSectionHeading: data.articleSectionHeading || "",
          articleSectionText: data.articleSectionText || "",
        });
        setGenericSection({
          section_heading: data.section_heading || "",
          section_text: data.section_text || "",
        });
        setIndustryPreview(data.image?.replace(/\\/g, "/"));
        setPreview(
          data.file ? `${process.env.NEXT_PUBLIC_API_URL}/${data.file.replace(/\\/g, "/")}` : null
        );
      }
    } catch (err) {
      console.error("Error fetching project data", err);
    }
  };

  const handleIndustryChange = (key, value) => {
    setIndustrySection((prev) => ({ ...prev, [key]: value }));
  };
  const handleArticleChange = (key, value) => {
    setArticleSection((prev) => ({ ...prev, [key]: value }));
  };
  const handleGenericSectionChange = (key, value) => {
    setGenericSection((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenericSectionSubmit = async () => {
    try {
      await updateApiWithFile(
        config.UpdateProjectDetails,
        "682d6732463d1cd07ffc9a73",
        genericSection,
        {}
      );
      setShowGenericSectionModal(false);
      fetchProjectData();
    } catch (err) {
      console.error("Error updating generic section", err);
    }
  };

  const handleArticleSubmit = async () => {
    try {
      await updateApiWithFile(
        config.UpdateProjectDetails,
        "682d6732463d1cd07ffc9a73",
        articleSection,
        {}
      );
      setShowArticleModal(false);
      fetchProjectData();
    } catch (err) {
      console.error("Error updating article section", err);
    }
  };

  const handleIndustryImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIndustrySection((prev) => ({ ...prev, image: file }));
      setIndustryPreview(URL.createObjectURL(file));
    }
  };

const handleIndustrySubmit = async () => {
  try {
    // ✅ exclude image from JSON so it doesn't overwrite backend field
    const { image, ...jsonPayload } = industrySection;

    const files = {};
    if (image instanceof File) {
      files.image = image;
    }

    await updateApiWithFile(
      config.UpdateProjectDetails,
      "682d6732463d1cd07ffc9a73",
      jsonPayload,   // ✅ no "image" here
      files          // ✅ only attach if selected
    );

    setShowIndustryModal(false);

    // optional: clear local file so next open doesn't accidentally re-send
    setIndustrySection((prev) => ({ ...prev, image: null }));

    fetchProjectData();
  } catch (err) {
    console.error("Error updating industry section", err);
  }
};

  const handleAboutChange = (key, value) => {
    setAboutProject((prev) => ({ ...prev, [key]: value }));
  };

  const handleAboutSubmit = async () => {
    try {
      await updateApiWithFile(
        config.UpdateProjectDetails,
        "682d6732463d1cd07ffc9a73",
        aboutProject,
        {}
      );
      setShowAboutModal(false);
      fetchProjectData();
    } catch (err) {
      console.error("Error updating about project", err);
    }
  };

  const handleProjectChange = (key, value) => {
    setProjectData((prev) => ({ ...prev, [key]: value }));
  };

  const handleProjectImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProjectData((prev) => ({ ...prev, file })); // only the new File
      setPreview(URL.createObjectURL(file));         // local preview
    }
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setProjectData((prev) => ({
      ...prev,
      additionalImages: [...prev.additionalImages, ...files],
    }));
  };

  const addAdditionalImage = () => {
    setProjectData((prev) => ({
      ...prev,
      additionalImages: [...prev.additionalImages, null],
    }));
  };

  const removeAdditionalImage = (index) => {
    const updated = [...projectData.additionalImages];
    updated.splice(index, 1);
    setProjectData((prev) => ({ ...prev, additionalImages: updated }));
  };

  const fetchGalleryHeader = async () => {
   
    try {
      const endpoint = config.GetBalancingDiet; // same as BeginYourJourney.tsx
      const payload = { type: "kapha" };
      const response = await postApi(endpoint, payload);
  
      const title = response?.data?.data?.[0]?.gallery_image_title;
      const subtitle = response?.data?.data?.[0]?.gallery_image_subtitle;
      const videotitle = response?.data?.data?.[0]?.gallery_video_title;
      const videosubtitle = response?.data?.data?.[0]?.gallery_video_subtitle;
  
     
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
  const handleProjectSubmit = async () => {
    try {
      const files = {};
      if (projectData.file instanceof File) {
        files.file = projectData.file; // attach only if new file chosen
      }
      files.additionalImages = projectData.additionalImages;


      // Exclude transient fields from JSON body
      const { file, fileUrl, ...jsonPayload } = projectData;

      await updateApiWithFile(
        config.UpdateProjectDetails,
        "682d6732463d1cd07ffc9a73",
        jsonPayload, // <-- no file/fileUrl keys in JSON
        files        // <-- only includes file if selected
      );
      setShowProjectModal(false);
      fetchProjectData();
    } catch (err) {
      console.error("Error updating project", err);
    }
  };
  const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    arrows: false,
    dots: true,
    swipeToSlide: true,
    swipe: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          arrows: true,
          dots: true,
        },
      },
      {
        breakpoint: 991,
        settings: {
          slidesToShow: 1,
          arrows: false,
          dots: true,
        },
      },
      {
        breakpoint: 767,
        settings: {
          arrows: false,
          dots: true,
          slidesToShow: 1,
        },
      },
    ],
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

  useEffect(() => {
    if (showProjectModal && !projectData.file) {
      setPreview(
        projectData.fileUrl
          ? `${process.env.NEXT_PUBLIC_API_URL}/${projectData.fileUrl}`
          : null
      );
    }
  }, [showProjectModal, projectData.file, projectData.fileUrl]);

const industryImgSrc =
  industryPreview?.startsWith("blob:") || industryPreview?.startsWith("http")
    ? industryPreview
    : industryPreview
    ? `${process.env.NEXT_PUBLIC_API_URL}/${industryPreview}`
    : "";

  return (
    <>
      {/* <Header arrayheader={arrayheader} /> */}
      {!isOwner ?
        <Header arrayheader={arrayheader} />
        : <h3 className="mt-3 ml-3" style={{ marginLeft: "15px" }}>Amita Home Page</h3>
      }
      {/* {!isOwner && <SubHeader />} */}
      <section className="amitaBanner">
        <div className="container-fluid">
          <div className="row">
            <div className="col-lg-7">
              <div className="amitaleftText">
                <h1>{projectData.name || "AMITA JAIN"}</h1>
                {isOwner && (
                  <Button
                    onClick={() => setShowProjectModal(true)}
                    className="btn btn-outline-info"
                  >
                    ✏️ Edit Banner Details{" "}
                  </Button>
                )}
                <p>{projectData?.text}</p>
              </div>
              <div className="row">
                <div className="col-md-3 pe-md-1">
                  <figure className="prjctImg">
                    {preview ? <img src={preview} alt="" /> : null}
                  </figure>
                </div>
                <div className="col-md-9 ps-md-3">
                  <div className="partform">
                    <strong className="mt-md-3 mb-2 d-block">
                      {projectData?.subText}
                    </strong>
                    <p>{projectData?.description}</p>
                    <div className="fillParticipant">
                      <div className="">
                        <h2>{projectData?.project_name || "PROJECT FIFTY 50"}</h2>

                        <span
                          dangerouslySetInnerHTML={{ __html: projectData?.project_text || "" }}
                        />


                      </div>
                      <button
                        type="button"
                        data-bs-target="#participForm"
                        data-bs-toggle="modal"
                        className="btn btn-primary fs-9"
                      >
                        {projectData?.signup_button_label || "Sign Up Here"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="row">
                <div className="col-md-6">
                  <figure className="rightFitness">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${projectData?.additionalImages[0]}`}
                      alt=""
                    />
                  </figure>
                </div>
                <div className="col-md-6">
                  <figure className="natureImg mb-2">
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${projectData?.additionalImages[1]}`}
                      alt=""
                    />
                  </figure>
                  <ul className="nameList">
                    {projectData.facilities?.split(",").map((item, index) => (
                      <li key={index}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------Schedule Section---------------------------------- */}

      {!isOwner && <Schedule />}
      {/* ----------------------------------------about ------------------------------------------------------- */}
      <section className="aboutProject">
        <div className="container-fluid">
          {isOwner &&
            <Button
              onClick={() => setShowAboutModal(true)}
              className="btn btn-outline-info "
            >
              ✏️ Edit About Section
            </Button>
          }
          <h6>{aboutProject?.aboutProjectHeading}</h6>
          <p>{aboutProject?.aboutProjectDescription}</p>
        </div>
      </section>

      {/* ----------------------------------------------------------------- slick desing ----------------------------------------- */}
      <section className="slickSec">
        <div className="container-fluid">
          {isOwner &&
            <>
              <div className="d-flex gap-3">
                <Button
                  onClick={() => setShowGenericSectionModal(true)}
                  className="btn btn-outline-info mt-2"
                >
                  ✏️ Edit Section
                </Button>
                <Link href={'/admin/Master/ProjectSection'} target="_parent" className="btn btn-primary mt-2 ml-3">✏️ Manage Caraousel Data </Link>

              </div> </>}

          <div className="section-heading">
            <img src="/images/landingpage/watermark.png" width="50" />

            <h2>{genericSection?.section_heading}</h2>
            <p className="mb-3">{genericSection?.section_text}</p>
          </div>

          <Slider {...settings} className="slider-nature">
            {projectsections.map((item, idx) => (
              <div className="sliderInner" key={idx}>
                <figure>
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${item?.image}`}
                    alt={item.text}
                  />
                </figure>
                <div className="sliderTxt">
                  <b>{item.text}</b>
                  <h4>{item.heading}</h4>
                  <p>{item.description}</p>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      <style jsx>{`

  /* remove unwanted dots  */
  :global(.slider-nature .slick-dots li button:before) {
    content: '' !important;
  }
 
`}</style>

      {/* ------------------------------------------------------------------next sections----------------------------- */}

      <div className=" py-0 ">
        <div className="container-fluid">
          <div className="section-heading ">
            <img src="/images/landingpage/watermark.png" width="50" />
            {isOwner &&
              <Button
                onClick={() => setShowIndustryModal(true)}
                className="btn btn-outline-info mt-2"
              >
                ✏️ Edit Section
              </Button>}
            <h2>{industrySection?.industrySectionHeading}</h2>
            <p>{industrySection?.industrySectionText}</p>
          </div>
        </div>
        <div className="amitajain p-0">
          <div className="container-fluid">
            <div className="row align-items-center">
              <div className="col-md-6">
                <figure className="mb-0 leftYoga">
                  <img src={industryImgSrc} alt="" />
                </figure>
              </div>
              <div className="col-md-6 p-md-4 p-3  pe-md-0">
                <div className="infoTxt   pe-0">
                  {/* <p>{industrySection?.industrySectionContent}</p> */}
                  <p
                    dangerouslySetInnerHTML={{
                      __html: industrySection?.industrySectionContent,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* -----------------------------------------------------articles sections------------------------- */}
      <section className="my-3 my-md-5">
        <div className="container-fluid">
          {isOwner &&
            <div className="d-flex gap-3"> <Button
              onClick={() => setShowArticleModal(true)}
              className="btn btn-outline-info mt-2"
            >
              ✏️ Edit Article Section
            </Button>
              <Link href={'/admin/Article-Management/Articles'} target="_parent" className="btn btn-primary mt-2 ml-3">✏️ Manage Articles Data </Link>
            </div>}
          <div className="section-heading text-start ms-0">
            <img src="/images/landingpage/watermark.png" width="50" />

            <h2>{articleSection?.articleSectionHeading}</h2>
            <p>{articleSection?.articleSectionText}</p>
          </div>
          <div className="row">
            {articles.slice(0, 3).map((article, index) => (
              <div className="col-md-4 col-lg-4 col-xl-4 mb-3 px-2" key={index}>
                <div className="articlesBx h-100">
                  <Link href={`/LandingPage/components/ArticleDetails/${article._id}`} style={{ cursor: 'pointer' }}>
                    <figure className="m-0 position-relative">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${article.file}`}
                        alt=""
                      />
                      <span>
                        <i className="bi bi-eye"></i> {article.viewCount || 0}
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
                        />
                        {article.auther_name}
                      </b>
                      <div className="d-flex align-items-center gap-3">
                        {/* <a href="">
                          <img
                            src="/images/landingpage/saved-icon.svg"
                            alt=""
                            width="30"
                          />
                        </a> */}
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
                    <p>Posted on: {article.date?.split("T")[0] || "N/A"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --------------------------------------------gallery section --------------------------------------- */}
      <section id="videos" className="videoGallery">
        <div className="container-fluid position-relative">
          {isOwner && (
            <Link
              style={{ float: 'right' }}
              href={'/admin/Master/GalleryVideos'}
              target="_parent"
              className="btn btn-primary mt-2 ml-3"
            >
              ✏️ Manage Gallery videos
            </Link>
          )}

          <div className="section-heading text-start ms-0 mw-100 p-0 mb-4">
            <img src="/images/landingpage/watermark.png" width="50" />
            <h2>{pagevideoTitle ? pagevideoTitle : "Video Gallery"}</h2>
            <p>{pagevideoSubtitle ? pagevideoSubtitle : "Lorem Ipsum is simply dummy text"}</p>
          </div>

          {/* Custom Navigation Buttons */}
          {videos?.length > 3 &&
            <div className="custom-nav-buttons-video">
              <button className="prev-button" onClick={goToPrevVideo}>
                <img src="/images/landingpage/prev-btn.svg" alt="Previous" />
              </button>
              <button className="next-button" onClick={goToNextVideo}>
                <img src="/images/landingpage/next-btn.svg" alt="Next" />
              </button>
            </div>
          }

          <Slider {...videoSliderSettings} ref={videoSliderRef} className="videoGallerySlide">
            {videos.map((video, index) => (
              <div key={index}>
                <div className="videoGalleryItem">
                  <figure className="videoInner position-relative">
                    {/* Thumbnail: If video, show <video> or default image */}
                    {video.file?.endsWith(".mp4") || video.file?.endsWith(".mov") ? (
                      <>
                        <video
                          src={`${process.env.NEXT_PUBLIC_API_URL}/${video.file}`}
                          width="100%"
                          height="200"
                          muted
                          loop
                          playsInline
                          style={{ objectFit: "cover", borderRadius: "6px", display: "block" }}
                        />
                        <button
                          className="video-play-btn"
                          onClick={() => {
                            setGallaryVideo(`${process.env.NEXT_PUBLIC_API_URL}/${video.file}`)
                            setShowGallaryVideoModel(true)
                            // const url = `${process.env.NEXT_PUBLIC_API_URL}/${video.file}`;
                            // window.open(url, "_blank");
                          }}
                        >
                          <img src="/images/landingpage/video-icon.svg" alt="Play Video" />
                        </button>
                      </>
                    ) : (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${video.file}`}
                        alt="Video thumbnail"
                        style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "6px" }}
                      />
                    )}
                  </figure>
                  <span className="fw-semibold d-block text-center mt-2">
                    {video.name || "Untitled Video"}
                  </span>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      </section>

      <style jsx>{`
  .custom-nav-buttons-video {
    position: absolute;
    top: 20%;
    right: 20px;
    display: flex;
    flex-direction: row;
    gap: 10px;
    z-index: 10;
  }

  .custom-nav-buttons-video .prev-button,
  .custom-nav-buttons-video .next-button {
    background-color: transparent;
    border: none;
    cursor: pointer;
    padding: 0;
    width: 40px;
    height: 40px;
  }

  .custom-nav-buttons-video .prev-button img,
  .custom-nav-buttons-video .next-button img {
    width: 89%;
    height: 89%;
  }

  .custom-nav-buttons-video .prev-button img:hover,
  .custom-nav-buttons-video .next-button img:hover {
    opacity: 0.8;
  }

  .videoGalleryItem {
    padding: 0 10px;
  }

  .videoGalleryItem .video-play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: transparent;
    border: none;
    cursor: pointer;
    z-index: 2;
  }

  .videoGalleryItem figure video {
    display: block;
    width: 100%;
    height: 200px;
    object-fit: cover;
    pointer-events: none;
  }

  /* Media query to hide buttons on smaller screens */
  @media (max-width: 767px) {
    .custom-nav-buttons-video {
      display: none;
    }
  }
`}</style>


      {/* --------------------------------------------------contact us section------------------------------------------ */}
      <section className="generalInquiries formsendNote">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6 pe-md-5 mb-4 mb-md-0">
              <div className="section-heading text-start mw-100 pb-3">
                <img
                  src="/images/landingpage/watermark.png"
                  width="50"
                  className="d-block"
                />
                <h2>Contact Amita Jain</h2>
              </div>
              <form onSubmit={handleSubmit} className="contactForm">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="First Name *"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="Last Name *"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="email"
                        className="form-control"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address *"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        type="tel"
                        className="form-control"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Enter Mobile Number *"
                        required
                        pattern="\d{10,}"
                        inputMode="numeric"
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="form-group">
                      <textarea
                        className="form-control"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Your Note *"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-12">
                    <div className="form-group">
                      <button
                        type="submit"
                        className="btn btn-primary px-4"
                        disabled={!isContactFormValid}
                        aria-disabled={!isContactFormValid}
                        title={!isContactFormValid ? "Please complete all required fields" : undefined}
                      >
                        Send
                      </button>
                    </div>
                  </div>


                </div>
              </form>
              {successMessage && (
                <div className="alert alert-success mt-3" role="alert">
                  {successMessage}
                </div>
              )}
            </div>
            <div className="col-md-6 ps-md-3 pe-md-4">
              <div className=" ps-md-5">
                <figure className="position-relative ">
                  <img src="/images/landingpage/online-yoga.jpg" alt="" />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!isOwner && <FooterSection />}

      {/*-------------------------------------------- main banner modal -------------------------- */}
      <Modal
        show={showProjectModal}
        onHide={() => setShowProjectModal(false)}
        size="lg"
        style={{ minWidth: '600px' }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Banner Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label> Name</Form.Label>
              <Form.Control
                value={projectData.name}
                onChange={(e) => handleProjectChange("name", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label> Text</Form.Label>
              <Form.Control
                value={projectData.text}
                onChange={(e) => handleProjectChange("text", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Sub Text</Form.Label>
              <Form.Control
                value={projectData.subText}
                onChange={(e) => handleProjectChange("subText", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Project Name</Form.Label>
              <Form.Control
                value={projectData.project_name}
                onChange={(e) => handleProjectChange("project_name", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Project Text</Form.Label>
              <ReactQuill
                theme="snow"
                value={projectData.project_text}
                onChange={(val) => handleProjectChange("project_text", val)}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link"],
                    ["clean"],
                  ],
                }}
                formats={[
                  "header",
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "list",
                  "bullet",
                  "link",
                ]}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={projectData.description}
                onChange={(e) =>
                  handleProjectChange("description", e.target.value)
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Facilities</Form.Label>
              <Form.Control
                value={projectData.facilities}
                onChange={(e) =>
                  handleProjectChange("facilities", e.target.value)
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Main Image</Form.Label>
              <br />
              {preview ? <img src={preview} width="200" className="mb-2" /> : null}
              <br />
              <Form.Control
                type="file"
                ref={fileRef}
                onChange={handleProjectImageChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Additional Images</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={handleAdditionalImagesChange}
              />

              <div className="d-flex flex-wrap mt-2">
                {projectData.additionalImages.map((file, index) => (
                  <div key={index} className="me-2 mb-2 position-relative">
                    <img
                      src={file instanceof File ? URL.createObjectURL(file) : `${process.env.NEXT_PUBLIC_API_URL}/${file}`}

                      alt={`Additional ${index}`}
                      style={{ width: "100px", borderRadius: "6px" }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      style={{ position: "absolute", top: 0, right: 0 }}
                      onClick={() => removeAdditionalImage(index)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => { setShowProjectModal(false), fetchProjectData() }}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleProjectSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* -----------------------------about model ----------------------------- */}
      <Modal
        show={showAboutModal}
        onHide={() => setShowAboutModal(false)}
        size="lg"
        style={{ minWidth: '600px' }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit About Project</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>About Project Heading</Form.Label>
              <Form.Control
                value={aboutProject.aboutProjectHeading}
                onChange={(e) =>
                  handleAboutChange("aboutProjectHeading", e.target.value)
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>About Project Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={aboutProject.aboutProjectDescription}
                onChange={(e) =>
                  handleAboutChange("aboutProjectDescription", e.target.value)
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAboutModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAboutSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ---------------------------------------------industry model --------------------------------------------------- */}
      <Modal
        show={showIndustryModal}
        onHide={() => setShowIndustryModal(false)}
        size="lg"
        style={{ minWidth: '600px' }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Industry Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Industry Section Heading</Form.Label>
              <Form.Control
                value={industrySection.industrySectionHeading}
                onChange={(e) =>
                  handleIndustryChange("industrySectionHeading", e.target.value)
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Industry Section Text</Form.Label>
              <Form.Control
                value={industrySection.industrySectionText}
                onChange={(e) =>
                  handleIndustryChange("industrySectionText", e.target.value)
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Industry Section Content</Form.Label>
              <ReactQuill
                value={industrySection.industrySectionContent}
                onChange={(value) =>
                  handleIndustryChange("industrySectionContent", value)
                }
                theme="snow"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Industry Image</Form.Label>
              <br />
              {industryPreview && (
                <img src={industryImgSrc} width="200" className="mb-2" />
              )}
              <br />
              <Form.Control
                type="file"
                ref={industryImageRef}
                onChange={handleIndustryImageChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowIndustryModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleIndustrySubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ------------------------------------------------------article model----------------------------------------------- */}

      <Modal
        show={showArticleModal}
        onHide={() => setShowArticleModal(false)}
        size="lg"
        style={{ minWidth: '600px' }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Article Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Article Section Heading</Form.Label>
              <Form.Control
                value={articleSection.articleSectionHeading}
                onChange={(e) =>
                  handleArticleChange("articleSectionHeading", e.target.value)
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Article Section Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={articleSection.articleSectionText}
                onChange={(e) =>
                  handleArticleChange("articleSectionText", e.target.value)
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowArticleModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleArticleSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* -----------------------------------slick sections modal----------------------------------------  */}
      <Modal
        show={showGenericSectionModal}
        onHide={() => setShowGenericSectionModal(false)}
        size="lg"
        style={{ minWidth: '600px' }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Generic Section</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Section Heading</Form.Label>
              <Form.Control
                value={genericSection.section_heading}
                onChange={(e) =>
                  handleGenericSectionChange("section_heading", e.target.value)
                }
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Section Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={genericSection.section_text}
                onChange={(e) =>
                  handleGenericSectionChange("section_text", e.target.value)
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowGenericSectionModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleGenericSectionSubmit}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>

      {/* <Modal
        show={showGallaryVideoModel}
        onHide={() => setShowGallaryVideoModel(false)}
        size="lg"
        style={{ minWidth: '600px' }}
      >
        <Modal.Header closeButton>
        </Modal.Header>
        <Modal.Body>
          
                <div style={{
 width: "100vw",
  height: "100vh",
  overflow: "hidden"
}}>
  <video
    src={gallaryVideo}
    controls
    style={{
      // Width: "100%",
      // maxHeight: "100%",
      // objectFit: "contain"
    }}
  />
</div>

                </Modal.Body>
        
      </Modal> */}

      <Modal
  show={showGallaryVideoModel}
  onHide={() => setShowGallaryVideoModel(false)}
  size="lg"
  centered
>
  <Modal.Header closeButton />

  <Modal.Body
    style={{
      height: "70vh",
      overflow: "hidden",
      // backgroundColor: "#000",
    }}
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <video
        src={gallaryVideo}
        controls
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          objectFit: "contain",
        }}
      />
    </div>
  </Modal.Body>
</Modal>


      <div className="modal fade" id="participForm">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-1 border-0">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">Participation Form</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleParticipationSubmit}>
                <div className="row align-items-center justify-content-center">
                  <div className="col-md-12">
                    <div className="contactForm row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label>First Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="firstName"
                            value={participationForm.firstName}
                            onChange={handleParticipationChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Last Name</label>
                          <input
                            type="text"
                            className="form-control"
                            name="lastName"
                            value={participationForm.lastName}
                            onChange={handleParticipationChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={participationForm.email}
                            onChange={handleParticipationChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label>Phone (U.S.)</label>
                        <div className="form-group">
                          <input
                            type="tel"
                            className={`form-control ${participationForm.phoneNumber && !isValidUSPhoneNumber(participationForm.phoneNumber) ? "is-invalid" : ""}`}
                            name="phoneNumber"
                            value={participationForm.phoneNumber}
                            onChange={handleParticipationChange}
                            placeholder="e.g. 5551234567 or +1 5551234567"
                            maxLength={10}
                            required
                          />
                          {participationForm.phoneNumber && !isValidUSPhoneNumber(participationForm.phoneNumber) && (
                            <div className="invalid-feedback">
                              Please enter a valid 10-digit U.S. phone number.
                            </div>
                          )}
                        </div>
                      </div>


                      <div className="col-md-6">
                        <label>DOB</label>
                        <div className="form-group">
                          <input
                            type="date"
                            className="form-control"
                            name="dob"
                            value={participationForm.dob}
                            onChange={handleParticipationChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Home Address</label>
                          <textarea
                            className="form-control"
                            name="homeAddress"
                            value={participationForm.homeAddress}
                            onChange={handleParticipationChange}
                            required
                            style={{ height: "80px" }}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Card Number</label>
                          <input
                            type="text"
                            className="form-control"
                            name="cardNumber"
                            value={participationForm.cardNumber}
                            onChange={handleParticipationChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <div className="form-group">
                          <label>Card Location</label>
                          <input
                            type="text"
                            className="form-control"
                            name="cardLocation"
                            value={participationForm.cardLocation}
                            onChange={handleParticipationChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-md-12 text-center mt-4">
                        <button type="submit" className="btn btn-primary px-4">
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

    </>
  );
};
export default AmitaJainHomePage;
