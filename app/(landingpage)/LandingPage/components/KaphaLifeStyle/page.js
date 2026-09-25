"use client";
import React, { useEffect, useState } from "react";
import Header from "../Header/page";
import InnerBanner from "../AmitajainInnerBanner/page";
import AboutAmitaJain from "../AboutAmitaJain/page";
import BackgroundOfHer from "../BackgroundOfHer/page";
import SendANoteToAmita from "../SendANoteToAmita/page";
import BhagavadGitaQuote from "../BhagavadGitaQuote/page";
import FooterSection from "../Footer/page";
import { postApi } from "services/api";
import { config } from "services/config";
import "../../public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "node_modules/next/link";
import { updateApiWithFile } from "services/api";
import { useRef } from "react";
import { checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';
// import SubHeader from "../SubHeader/page";
const KaphaLifeStyle = () => {
  const id = "682832518fbb838c756464f2"; // Replace with actual ObjectId
  const type = "kapha"; // Assuming type is kapha
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

  const [bannerText, setBannerText] = useState("");
  const [editingText, setEditingText] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    button_label: "",
    button_route: "",
    balancing_kapha_dosha_text: "",
    balancing_kapha_dosha_description: "",
    balancing_kapha_dosha_list: [],
  });

  useEffect(() => {
    fetchBannerData();
    window.scrollTo(0, 0);
  }, []);

  const fetchBannerData = async () => {
    try {
      const res = await postApi(config.GetLifeStyle, { type });

      const data = res?.data?.[0];
      if (data) {
        setBannerText(data.banner_title || "Kapha Dosha Balancing Lifestyle");
        setFormData({
          title: data.title || "",
          description: data.description || "",
          button_label: data.button_label || "",
          button_route: data.button_route || "",
          balancing_kapha_dosha_text: data.balancing_kapha_dosha_text || "",
          balancing_kapha_dosha_description:
            data.balancing_kapha_dosha_description || "",
          balancing_kapha_dosha_list: data.balancing_kapha_dosha_list || [],
        });
        if (data.file) {
          const imageUrl =
            `${process.env.NEXT_PUBLIC_API_URL}/${data.file}`.replace(
              /\\/g,
              "/"
            );
          setImagePreview(imageUrl);
        }
      }
    } catch (err) {
      console.error("Error fetching banner data", err);
    }
  };

  const handleBannerTextUpdate = async () => {
    try {
      const payload = { banner_title: bannerText };
      const res = await updateApiWithFile(
        config.UpdateLifeStyle,
        id,
        payload,
        {}
      );
      if (res?.statusCode === 200) {
        setEditingText(false);
      }
    } catch (err) {
      console.error("Error updating banner text", err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      updateBannerImage(file);
    }
  };

  const updateBannerImage = async (file) => {
    try {
      const files = { file };
      const payload = {};
      const res = await updateApiWithFile(
        config.UpdateLifeStyle,
        id,
        payload,
        files
      );
      if (res?.statusCode === 200 && res.data.file) {
        const updatedUrl =
          `${process.env.NEXT_PUBLIC_API_URL}/${res.data.file}`.replace(
            /\\/g,
            "/"
          );
        setImagePreview(updatedUrl);
      }
    } catch (err) {
      console.error("Error updating image", err);
    }
  };
  const handleSubmit = async () => {
    try {
      await updateApiWithFile(config.UpdateLifeStyle, id, formData, {});
      setShowModal(false);
    } catch (err) {
      console.error("Error updating lifestyle details", err);
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
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Kapha LifeStyle Page</h3>
    }
 {/* {!isOwner && <SubHeader />} */}
      <>
        <div
          className="innerBanner doshasBanner"
          style={{
            backgroundImage: `url('${
              imagePreview || "/images/landingpage/kapha-lifestyle-banner.jpg"
            }')`,
          }}
        >
          <div className="container">
            <div className="innerBannertxt">
              {editingText ? (
                <div
                  style={{ display: "flex", gap: "8px", alignItems: "center" }}
                >
                  <input
                    type="text"
                    value={bannerText}
                    onChange={(e) => setBannerText(e.target.value)}
                    style={{ padding: "6px", width: "300px" }}
                  />
                  <button onClick={handleBannerTextUpdate}>Save</button>
                  <button onClick={() => setEditingText(false)}>Cancel</button>
                </div>
              ) : (
                <>
                  <h1>{bannerText}</h1>
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
                <li className="breadcrumb-item active" aria-current="page">
                  Kapha{" "}
                </li>
              </ol>
            </div>
           

            <div className="section-heading">
              <img
                src="/images/landingpage/watermark.png"
                width={50}
                className="d-block mx-auto"
              />
              <h2>{formData?.title}</h2>
              <p>{formData?.description}</p>
              {/* <a href="#" className="btn btn-primary mt-3">
                View Kapha Diet
              </a> */}
              <Link
                href={formData?.button_route}
                className="btn btn-primary mt-3"
              >
                {formData?.button_label}
              </Link>
               {isOwner && 
            <button
              className="btn btn-primary mt-3 ml-3"
              onClick={() => setShowModal(true)}
              style={{marginLeft:'5px'}}
            >
              📝 Edit Details
            </button>
            }
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
                {formData?.balancing_kapha_dosha_text}
              </h2>
              <p>{formData?.balancing_kapha_dosha_description}</p>
            </div>
            <ul className="overviewUl p-0">
              {formData?.balancing_kapha_dosha_list?.map((item, index) => (
                <li className="m-0" key={index}>
                  <img
                    src="/images/landingpage/accordian-icon.svg"
                    alt=""
                    width={12}
                  />
                  <p>{item}</p>
                </li>
              ))}

            </ul>
          </div>
        </div>
      </>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{minWidth:'600px'}}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Lifestyle Details</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {[
                    "title",
                    "description",
                    "button_label",
                    "button_route",
                    "balancing_kapha_dosha_text",
                    "balancing_kapha_dosha_description",
                  ].map((key) => (
                    <div className="col-md-6" key={key}>
                      <label className="form-label">
                        {key.replace(/_/g, " ")}
                      </label>
                      <input
                        className="form-control"
                        value={formData[key]}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>

                <label className="form-label mt-3">
                  Balancing Kapha Dosha List
                </label>
                {formData.balancing_kapha_dosha_list?.map((item, index) => (
                  <div key={index} className="d-flex gap-2 mb-2">
                    <input
                      className="form-control"
                      value={item}
                      onChange={(e) => {
                        const updated = [
                          ...formData.balancing_kapha_dosha_list,
                        ];
                        updated[index] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          balancing_kapha_dosha_list: updated,
                        }));
                      }}
                    />
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        const updated = [
                          ...formData.balancing_kapha_dosha_list,
                        ];
                        updated.splice(index, 1);
                        setFormData((prev) => ({
                          ...prev,
                          balancing_kapha_dosha_list: updated,
                        }));
                      }}
                    >
                      -
                    </button>
                  </div>
                ))}
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      balancing_kapha_dosha_list: [
                        ...prev.balancing_kapha_dosha_list,
                        "",
                      ],
                    }))
                  }
                >
                  + Add List Item
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
{!isOwner &&
      <FooterSection />}
    </>
  );
};

export default KaphaLifeStyle;
