"use client";
import React, { useEffect, useState, useRef } from "react";
import Header from "../Header/page";
import InnerBanner from "../AmitajainInnerBanner/page";
import AboutAmitaJain from "../AboutAmitaJain/page";
import BackgroundOfHer from "../BackgroundOfHer/page";
import SendANoteToAmita from "../SendANoteToAmita/page";
import BhagavadGitaQuote from "../BhagavadGitaQuote/page";
import FooterSection from "../Footer/page";
import { postApi, updateApiWithFile } from "services/api";
import { config } from "services/config";
import "../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "node_modules/next/link";
import { checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';
// import SubHeader from "../SubHeader/page";
const TreatingDoshasImbalance = () => {
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
  const [showModal, setShowModal] = useState(false);
  const [selectedDosha, setSelectedDosha] = useState("kapha"); // default
  const [formData, setFormData] = useState({});
  const [bannerInput, setBannerInput] = useState("");
  const [editingText, setEditingText] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const res = await postApi(config.GetTreatingDosha, {
        id: "682ab8c816097ad1665b7efe",
      });
      const data = res?.data;
      if (data) {
        setFormData(data);
        setBannerInput(data.banner_title || "Treating A Dosha Imbalance");

        const imageUrl = data?.banner_image
          ? `${process.env.NEXT_PUBLIC_API_URL}/${data.banner_image}`.replace(
              /\\/g,
              "/"
            )
          : "/images/landingpage/treating-doshas-banner.jpg";

        setImagePreview(imageUrl);
      }
    } catch (err) {
      console.error("Error loading dosha content", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file }));
      setImagePreview(URL.createObjectURL(file));
      updateBannerImage(file);
    }
  };

  const updateBannerImage = async (file) => {
    try {
      const files = { file };
      const res = await updateApiWithFile(
        config.UpdateTreatingDosha,
        "682ab8c816097ad1665b7efe",
        {},
        files
      );
      if (res?.statusCode === 200) {
        const updatedUrl = `${process.env.NEXT_PUBLIC_API_URL}/${res.data.file}`;
        setImagePreview(updatedUrl.replace(/\\/g, "/"));
        fetchDetails();
      }
    } catch (err) {
      console.error("Error updating image", err);
    }
  };

  const handleBannerTextUpdate = async () => {
    try {
      const payload = { banner_title: bannerInput };
      const res = await updateApiWithFile(
        config.UpdateTreatingDosha,
        "682ab8c816097ad1665b7efe",
        payload,
        {}
      );
      if (res?.statusCode === 200) {
        console.log(res);
        setFormData((prev) => ({ ...prev, banner_title: bannerInput }));
        setEditingText(false);
      }
    } catch (err) {
      console.error("Error updating banner text", err);
    }
  };

  const handleDoshaChange = (key, value) => {
    const prefix = `${selectedDosha}_`;

    const getField = (key) => formData?.dosha_content?.[prefix + key] || "";

    const setField = (key, value) => {
      setFormData((prev) => ({
        ...prev,
        dosha_content: {
          ...prev.dosha_content,
          [prefix + key]: value,
        },
      }));
    };
  };

  const handleSubmit = async () => {
    try {
      await updateApiWithFile(
        config.UpdateTreatingDosha,
        "682ab8c816097ad1665b7efe",
        {
          dosha_content: formData.dosha_content,
        },
        {}
      );

      setShowModal(false);
      fetchDetails();
    } catch (err) {
      console.error("Error updating dosha content", err);
    }
  };

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
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Dosha Imbalance Page</h3>
    }
 {/* {!isOwner && <SubHeader />} */}
      <>
        <div
          className="innerBanner bannerafter"
          style={{ backgroundImage: `url('${imagePreview}')` }}
        >
          <div className="container-fluid">
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
                  {/* <h1>{formData.banner_title}</h1> */}
                      <h1
  dangerouslySetInnerHTML={{
    __html: (formData.banner_title || "Job Openings At Vedic")
      .split(" ")
      .reduce((acc, word, i) => {
        const groupIndex = Math.floor(i / 3);
        acc[groupIndex] = acc[groupIndex] || [];
        acc[groupIndex].push(word);
        return acc;
      }, [])
      .map(words => words.join(" "))
      .join("<br />")
  }}
/>
                  {isOwner && <button
                    onClick={() => setEditingText(true)}
                    className="btn btn-primary"
                    style={{ marginTop: "10px", marginRight: "6px" }}
                  >
                    ✏️ Edit Banner Text
                  </button>}
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
        {isOwner && 
        <button
          className="btn btn-primary mt-5 mb-3 ms-3"
          onClick={() => setShowModal(true)}
        >
          📝 Edit Dosha Details
        </button>
}
        <div className="productDetails my-0 bg-white">
          <div className="container-fluid">
            <div className="pdHeading">
              <img
                src="/images/landingpage/watermark.png"
                width={40}
                className="d-block"
              />
              <h2 className="text-black fs-6 d-flex align-items-center fw-semibold">
                {formData?.dosha_content?.vata_title}
                <lottie-player
                  src="/images/landingpage/air.json"
                  loop=""
                  autoPlay=""
                  style={{ width: 30, height: 30, marginLeft: 20 }}
                />
              </h2>
            </div>
            <p className="mb-4">{formData?.dosha_content?.vata_description}</p>

            <span> {formData?.dosha_content?.vata_signs_heading_text}</span>
            <ul className="overviewUl spacingUl p-0">
              {formData?.dosha_content?.vata_signs_list?.map((item, index) => (
                <li key={index}>
                  <img
                    src="/images/landingpage/accordian-icon.svg"
                    alt=""
                    width={12}
                  />
                  <p>
                    {item}
                  </p>
                </li>
              ))}

            </ul>
            <Link
              href={formData?.dosha_content?.vata_button_1_route ? formData?.dosha_content?.vata_button_1_route :"/"}
              className="btn btn-primary me-2 mb-3"
            >
             {formData?.dosha_content?.vata_button_1_label}
            </Link>
            <Link href={formData?.dosha_content?.vata_button_2_route ? formData?.dosha_content?.vata_button_2_route :"/"} className="btn btn-primary mb-3">
               {formData?.dosha_content?.vata_button_2_label}
            </Link>
          </div>
        </div>
        <div className="productDetails my-0 ">
          <div className="container-fluid">
            <div className="pdHeading">
              <img
                src="/images/landingpage/watermark.png"
                width={40}
                className="d-block"
              />
              <h2 className="text-black fs-6 d-flex align-items-center fw-semibold">
                 {formData?.dosha_content?.pitta_title}
                <lottie-player
                  src="/images/landingpage/fire.json"
                  loop=""
                  autoPlay=""
                  style={{ width: 30, height: 30, marginLeft: 20 }}
                />
              </h2>
            </div>
            <p className="mb-4">
             {formData?.dosha_content?.pitta_description}
            </p>
           
            <span> {formData?.dosha_content?.pitta_signs_heading_text}</span>
            <ul className="overviewUl spacingUl p-0">
               {formData?.dosha_content?.pitta_signs_list?.map((item, index) => (
                <li key={index}>
                  <img
                    src="/images/landingpage/accordian-icon.svg"
                    alt=""
                    width={12}
                  />
                  <p>
                    {item}
                  </p>
                </li>
              ))}
             
            </ul>
            <Link
             href={formData?.dosha_content?.pitta_button_1_route ? formData?.dosha_content?.pitta_button_1_route :"/"}
              className="btn btn-primary me-3 mb-3"
            >
              {formData?.dosha_content?.pitta_button_1_label}
            </Link>
            <Link
          href={formData?.dosha_content?.pitta_button_2_route ? formData?.dosha_content?.pitta_button_2_route :"/"}
             className="btn btn-primary mb-3">
             {formData?.dosha_content?.pitta_button_2_label}
            </Link>
          </div>
        </div>
        <div className="productDetails bg-white my-0">
          <div className="container-fluid">
            <div className="pdHeading">
              <img
                src="/images/landingpage/watermark.png"
                width={40}
                className="d-block"
              />
              <h2 className="text-black fs-6 d-flex align-items-center fw-semibold">
                {formData?.dosha_content?.kapha_title}
                <lottie-player
                  src="/images/landingpage/earth.json"
                  loop=""
                  autoPlay=""
                  style={{ width: 30, height: 30, marginLeft: 20 }}
                />
              </h2>
            </div>
            <p>
             {formData?.dosha_content?.kapha_description}
            </p>
           
            <span> {formData?.dosha_content?.kapha_signs_heading_text}</span>
            <ul className="overviewUl spacingUl p-0">
               {formData?.dosha_content?.kapha_signs_list?.map((item, index) => (
                <li key={index}>
                  <img
                    src="/images/landingpage/accordian-icon.svg"
                    alt=""
                    width={12}
                  />
                  <p>
                    {item}
                  </p>
                </li>
              ))}
            
            </ul>
            <Link
              href={formData?.dosha_content?.kapha_button_1_route ? formData?.dosha_content?.kapha_button_1_route :"/"}
              className="btn btn-primary me-3 mb-3"
            >
             {formData?.dosha_content?.kapha_button_1_label}
            </Link>
            <Link
            href={formData?.dosha_content?.kapha_button_2_route ? formData?.dosha_content?.kapha_button_2_route :"/"}
             className="btn btn-primary mb-3">
             {formData?.dosha_content?.kapha_button_2_label}
            </Link>
          </div>
        </div>
      </>
      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{minWidth:'600px'}}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Dosha Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Select Dosha</label>
                  <select
                    className="form-select"
                    value={selectedDosha}
                    onChange={(e) => setSelectedDosha(e.target.value)}
                  >
                    <option value="kapha">Kapha</option>
                    <option value="pitta">Pitta</option>
                    <option value="vata">Vata</option>
                  </select>
                </div>

                {/* Helper functions */}
                {(() => {
                  const prefix = `${selectedDosha}_`;
                  const getField = (key) =>
                    formData?.dosha_content?.[prefix + key] || "";
                  const setField = (key, value) =>
                    setFormData((prev) => ({
                      ...prev,
                      dosha_content: {
                        ...prev.dosha_content,
                        [prefix + key]: value,
                      },
                    }));

                  return (
                    <>
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Title</label>
                          <input
                            className="form-control"
                            value={getField("title")}
                            onChange={(e) => setField("title", e.target.value)}
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Description</label>
                          <textarea
                            className="form-control"
                            value={getField("description")}
                            onChange={(e) =>
                              setField("description", e.target.value)
                            }
                          />
                        </div>
                        <div className="col-md-12 mb-3">
                          <label className="form-label">
                            Signs Heading Text
                          </label>
                          <input
                            className="form-control"
                            value={getField("signs_heading_text")}
                            onChange={(e) =>
                              setField("signs_heading_text", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <label className="form-label">Signs List</label>
                      {(getField("signs_list") || []).map((item, index) => (
                        <div className="d-flex gap-2 mb-2" key={index}>
                          <input
                            className="form-control"
                            value={item}
                            onChange={(e) => {
                              const updated = [...getField("signs_list")];
                              updated[index] = e.target.value;
                              setField("signs_list", updated);
                            }}
                          />
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              const updated = [...getField("signs_list")];
                              updated.splice(index, 1);
                              setField("signs_list", updated);
                            }}
                          >
                            -
                          </button>
                        </div>
                      ))}
                      <button
                        className="btn btn-secondary mb-3"
                        onClick={() =>
                          setField("signs_list", [
                            ...getField("signs_list"),
                            "",
                          ])
                        }
                      >
                        + Add Sign
                      </button>

                      <div className="row">
                        <div className="col-md-6">
                          <label className="form-label">Button 1 Label</label>
                          <input
                            className="form-control"
                            value={getField("button_1_label")}
                            onChange={(e) =>
                              setField("button_1_label", e.target.value)
                            }
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Button 1 Route</label>
                          <input
                            className="form-control"
                            value={getField("button_1_route")}
                            onChange={(e) =>
                              setField("button_1_route", e.target.value)
                            }
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Button 2 Label</label>
                          <input
                            className="form-control"
                            value={getField("button_2_label")}
                            onChange={(e) =>
                              setField("button_2_label", e.target.value)
                            }
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Button 2 Route</label>
                          <input
                            className="form-control"
                            value={getField("button_2_route")}
                            onChange={(e) =>
                              setField("button_2_route", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </>
                  );
                })()}
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
{!isOwner && 
      <FooterSection />}
    </>
  );
};

export default TreatingDoshasImbalance;
