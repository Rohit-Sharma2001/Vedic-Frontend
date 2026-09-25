"use client";
import React, { useEffect, useState ,useRef} from "react";
import Header from "../Header/page";
import InnerBanner from "../AmitajainInnerBanner/page";
import AboutAmitaJain from "../AboutAmitaJain/page";
import BackgroundOfHer from "../BackgroundOfHer/page";
import SendANoteToAmita from "../SendANoteToAmita/page";
import BhagavadGitaQuote from "../BhagavadGitaQuote/page";
import FooterSection from "../Footer/page";
import { updateApiWithFile, postApi } from "services/api";
import "../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "node_modules/next/link";
import { config } from "services/config";
import { checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';
// import SubHeader from "../SubHeader/page";
const VataLifeStyle = () => {
const id = "6828214c58d1de03b6e4067d"; // replace with correct ObjectId
  const type = "vata";
 const [isOwner, setIsOwner] = useState(false);

const pathname = usePathname();

useEffect(() => {
  const isIframe = typeof window !== "undefined" && window.self !== window.top;
  const isAdminPath = pathname?.includes('/admin');
  const isAdminUser = checkIsOwner();

  if (isAdminUser && (isIframe || isAdminPath)) {
    setIsOwner(true);
  }
}, [pathname]);
  const [bannerInput, setBannerInput] = useState("");
  const [editingText, setEditingText] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    bannerImage: null,
    bannerText: "",
    title: "",
    description: "",
    diet_section_heading: "",
    diet_description: "",
    suggestions_list: [],
    food_suggestion_section_heading: "",
    food_suggestion_section_description: "",
    food_suggestions_list: [],
  });

  useEffect(() => {
    if (showModal) fetchData();
  }, [showModal]);

  const fetchData = async () => {
    try {
      const res = await postApi(config.GetBalancingDiet, { type });
      const data = res?.data?.data?.[0];
      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          diet_section_heading: data.diet_section_heading || "",
          diet_description: data.diet_description || "",
          suggestions_list: data.suggestions_list || [],
          food_suggestion_section_heading:
            data.food_suggestion_section_heading || "",
          food_suggestion_section_description:
            data.food_suggestion_section_description || "",
          food_suggestions_list: data.food_suggestions_list || [],
        });
      }
    } catch (err) {
      console.error("Failed to fetch modal data", err);
    }
  };

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleArrayChange = (key, index, value) => {
    const updated = [...formData[key]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [key]: updated }));
  };

  const handleArrayAdd = (key, defaultValue = "") => {
    setFormData((prev) => ({ ...prev, [key]: [...prev[key], defaultValue] }));
  };

  const handleArrayRemove = (key, index) => {
    const updated = [...formData[key]];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, [key]: updated }));
  };

  const handleFoodSuggestionChange = (index, field, value) => {
    const updated = [...formData.food_suggestions_list];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, food_suggestions_list: updated }));
  };

  const addFoodSuggestion = () => {
    setFormData((prev) => ({
      ...prev,
      food_suggestions_list: [
        ...prev.food_suggestions_list,
        { title: "", text: "" },
      ],
    }));
  };

  const removeFoodSuggestion = (index) => {
    const updated = [...formData.food_suggestions_list];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, food_suggestions_list: updated }));
  };

  const handleSubmit = async () => {
    try {
      await updateApiWithFile(config.UpdateBalancingDiet, id, formData, {});
      setShowModal(false);
    } catch (err) {
      console.error("Error updating", err);
    }
  };

  useEffect(() => {
    fetchInitialData();
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when the page loads
  }, []);

  const fetchInitialData = async () => {
    try {
      const res = await postApi(config.GetBalancingDiet, { type });
      if (res?.statusCode === 200) {
        console.log(res.data);
        let imageUrl = res.data.data[0].file
          ? `${process.env.NEXT_PUBLIC_API_URL}/${res.data.data[0].file}`.replace(
              /\\/g,
              "/"
            )
          : null;
        if (imageUrl) imageUrl = imageUrl.replace(/\\/g, "/");

        setFormData({
          bannerImage: null,
          bannerText:
            res.data.data[0].banner_title || "Kapha Dosha Balancing Lifestyle",
          title: res.data.data[0].title || "",
          description: res.data.data[0].description || "",
          diet_section_heading: res.data.data[0].diet_section_heading || "",
          diet_description: res.data.data[0].diet_description || "",
          suggestions_list: res.data.data[0].suggestions_list || [],
          food_suggestion_section_heading:
            res.data.data[0].food_suggestion_section_heading || "",
          food_suggestion_section_description:
            res.data.data[0].food_suggestion_section_description || "",
          food_suggestions_list: res.data.data[0].food_suggestions_list || [],
        });
        setBannerInput(res.data.data[0].banner_title || "");
        setImagePreview(imageUrl);
      }
    } catch (err) {
      console.error("Error fetching banner data", err);
    }
  };

  const handleBannerTextUpdate = async () => {
    try {
      const payload = { banner_title: bannerInput };
      const res = await updateApiWithFile(
        config.UpdateBalancingDiet,
        id,
        payload,
        {}
      );
      if (res?.statusCode === 200) {
        setFormData((prev) => ({ ...prev, bannerText: bannerInput }));
        setEditingText(false);
      }
    } catch (err) {
      console.error("Error updating title", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, bannerImage: file }));
      setImagePreview(URL.createObjectURL(file));
      updateBannerImage(file);
    }
  };

  const updateBannerImage = async (file) => {
    try {
      const files = { file };
      const payload = {};
      const res = await updateApiWithFile(
        config.UpdateBalancingDiet,
        id,
        payload,
        files
      );
      if (res?.statusCode === 200) {
        const updatedUrl = `${process.env.NEXT_PUBLIC_API_URL}/${res.data.file}`;
        setImagePreview(updatedUrl.replace(/\\/g, "/"));
        fetchInitialData();
      }
    } catch (err) {
      console.error("Error updating image", err);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top when the page loads
  }, []);

  const arrayheader = [
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
  ];

return (
    <>
      {/* <Header arrayheader={arrayheader} /> */}
        {!isOwner ?
      <Header arrayheader={arrayheader} />
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Your Doshas Page</h3>
    }
     {/* {!isOwner && <SubHeader />} */}
      <>
        <div
          className="innerBanner doshasBanner"
          style={{ backgroundImage: `url('${imagePreview}')` }}
        >
          <div className="container">
            <div className="innerBannertxt">
              {editingText ? (
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <input
                    type="text"
                    value={bannerInput}
                    onChange={(e) => setBannerInput(e.target.value)}
                    style={{ padding: "6px", width: "300px" }}
                  />
                  <button onClick={handleBannerTextUpdate}>Save</button>
                  <button onClick={() => setEditingText(false)}>Cancel</button>
                </div>
              ) : (
                <>
                  <h1>{formData.bannerText}</h1>
                  {isOwner && 
                  <button
                  className="btn btn-primary"
                    onClick={() => setEditingText(true)}
                    style={{ marginTop: "10px", marginRight: "6px" }}
                  >
                    ✏️ Edit Banner Text
                  </button>
                  }
                </>
              )}
              {isOwner && 
              <button
              className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                style={{ marginTop: "10px" }}
              >
                ✏️ Edit Banner Image
              </button>
              }
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
            </div>
          </div>
        </div>

        <div className="dietPlan">
          <div className="container-fluid">
            <div className="breadcrumbGroup mt-4">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  {/* <a href="#">Ayurvedic Doshas</a> */}
                  <Link href="/LandingPage/components/YourDoshas">
                    Ayurvedic Doshas
                  </Link>
                </li>
                <li className="breadcrumb-item">
                  {/* <a href="#">Vata</a> */}
                  <Link href="/LandingPage/components/VataBalancingDiet">
                    Vata
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Vata Balancing LifeStyle
                </li>
              </ol>
            </div>
            {isOwner && 
            <button
              className="btn btn-primary mb-3"
              onClick={() => setShowModal(true)}
            >
              📝 Edit Details
            </button>
            }
            <div className="section-heading text-start w-100 p-0">
              <img src="/images/landingpage/watermark.png" width={50} />

              <h2>{formData?.title} </h2>
              <p className="mb-3">{formData?.description}</p>
            </div>
          </div>
        </div>
        <div
          className="productDetails mt-3"
          style={{ backgroundImage: "url(/images/landingpage/circle-bg.svg)" }}
        >
          <div className="container-fluid">
            <div className="pdHeading">
              <img
                src="/images/landingpage/watermark.png"
                width={40}
                className="d-block"
              />
              <h2 className="text-black fs-6 d-flex align-items-center fw-semibold mb-3">
                {formData?.diet_section_heading}
              </h2>
              <p>{formData?.diet_description}</p>
            </div>
            <ul className="overviewUl p-0">
              {formData?.suggestions_list?.map((item, index) => {
                return (
                  <li className="m-0" key={index}>
                    <img
                      src="/images/landingpage/accordian-icon.svg"
                      alt=""
                      width={12}
                    />
                    <p>{item}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
        <div className="productDetails mt-0 bg-white py-0">
          <div className="container-fluid">
            <div className="pdHeading">
              <img
                src="/images/landingpage/watermark.png"
                width={40}
                className="d-block"
              />
              <h2 className="text-black fs-6 d-flex align-items-center fw-semibold mb-3">
                {formData?.food_suggestion_section_heading}
              </h2>
              <p>{formData?.food_suggestion_section_description}</p>
            </div>
            <ul className="overviewUl p-0">
              {formData?.food_suggestions_list?.map((item, index) => {
                return (
                  <li className="m-0" key={index}>
                    <img
                      src="/images/landingpage/accordian-icon.svg"
                      alt=""
                      width={12}
                    />
                    <p>
                  <span className="d-inline"> {item.title} </span>{item.text}
                </p>
                  </li>
                );
              })}

             
            </ul>
          </div>
        </div>
      </>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{minWidth:'600px'}}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Diet Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">Title</label>
                    <input
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      className="form-control mb-3"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        handleChange("description", e.target.value)
                      }
                      className="form-control mb-3"
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Diet Section Heading</label>
                    <input
                      value={formData.diet_section_heading}
                      onChange={(e) =>
                        handleChange("diet_section_heading", e.target.value)
                      }
                      className="form-control mb-3"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Diet Description</label>
                    <textarea
                      value={formData.diet_description}
                      onChange={(e) =>
                        handleChange("diet_description", e.target.value)
                      }
                      className="form-control mb-3"
                    />
                  </div>
                </div>

                <label className="form-label">Suggestions List</label>
                {formData.suggestions_list?.map((item, index) => (
                  <div className="d-flex gap-2 mb-2" key={index}>
                    <input
                      value={item}
                      onChange={(e) =>
                        handleArrayChange(
                          "suggestions_list",
                          index,
                          e.target.value
                        )
                      }
                      className="form-control"
                    />
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        handleArrayRemove("suggestions_list", index)
                      }
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-secondary mb-3"
                  onClick={() => handleArrayAdd("suggestions_list")}
                >
                  + Add Suggestion
                </button>

                <div className="row">
                  <div className="col-md-6">
                    <label className="form-label">
                      Food Suggestion Section Heading
                    </label>
                    <input
                      value={formData.food_suggestion_section_heading}
                      onChange={(e) =>
                        handleChange(
                          "food_suggestion_section_heading",
                          e.target.value
                        )
                      }
                      className="form-control mb-3"
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">
                      Food Suggestion Section Description
                    </label>
                    <textarea
                      value={formData.food_suggestion_section_description}
                      onChange={(e) =>
                        handleChange(
                          "food_suggestion_section_description",
                          e.target.value
                        )
                      }
                      className="form-control mb-3"
                    />
                  </div>
                </div>

                <label className="form-label">Food Suggestions</label>
                {formData.food_suggestions_list?.map((item, index) => (
                  <div className="row g-2 align-items-end mb-3" key={index}>
                    <div className="col-md-5">
                      <label className="form-label">Title</label>
                      <input
                        value={item.title}
                        onChange={(e) =>
                          handleFoodSuggestionChange(
                            index,
                            "title",
                            e.target.value
                          )
                        }
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label">Text</label>
                      <input
                        value={item.text}
                        onChange={(e) =>
                          handleFoodSuggestionChange(
                            index,
                            "text",
                            e.target.value
                          )
                        }
                        className="form-control"
                      />
                    </div>
                    <div className="col-md-2">
                      <button
                        className="btn btn-danger w-100"
                        onClick={() => removeFoodSuggestion(index)}
                      >
                        - Remove
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  className="btn btn-secondary"
                  onClick={addFoodSuggestion}
                >
                  + Add Food Suggestion
                </button>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleSubmit}>
                  Save
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!isOwner && <FooterSection />}

    </>
  );
};

export default VataLifeStyle;
