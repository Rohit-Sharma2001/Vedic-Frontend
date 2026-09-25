"use client";
import React, { useEffect, useState } from "react";
import Header from "../Header/page";
import InnerBanner from "../AmitajainInnerBanner/page";
import AboutAmitaJain from "../AboutAmitaJain/page";
import BackgroundOfHer from "../BackgroundOfHer/page";
import SendANoteToAmita from "../SendANoteToAmita/page";
import BhagavadGitaQuote from "../BhagavadGitaQuote/page";
import FooterSection from "../Footer/page";
import { postApi, updateApiWithFile } from "services/api";
import { config } from "services/config";
import '../../public/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min';
import { checkIsOwner } from "services/config";
import { usePathname } from 'next/navigation';
// import SubHeader from "../SubHeader/page";
import Loader from "services/Loader/page";
import Swal from "sweetalert2";
import LoginPopup from "services/Pop-ups/LoginPopup/page";
const DonateHealing = () => {
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
  const [donateData, setDonateData] = useState({});
  const [bannerPreview, setBannerPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cards, setCards] = useState([{ text: "", description: "" }]);

  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processData, setProcessData] = useState({
    process_title: "",
    icon_file: "",
    process_image_description: "",
    process_description: "",
    steps: [""],
    suggested_amounts: [{ text: "", price: "" }],
    suggested_modal_text: "",
    note: ""
  });
  const [iconFile, setIconFile] = useState(null);
  
  // Donation modal states
  const [showDonationModal, setShowDonationModal] = useState(false);
  const [donationForm, setDonationForm] = useState({
    amount: "",
    description: "",
    message: ""
  });
  const [donationLoading, setDonationLoading] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    fetchDonateData();
    // Get user data from localStorage
    if (typeof window !== "undefined") {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setUserData(user);
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  const fetchDonateData = async () => {
    try {
      const res = await postApi(config.GetDonateData, { id: "682af5e65f6ed1d63517b87a" });
      const data = res?.data;
      console.log(res)
      if (data) {
        setDonateData(data);
        if (data?.cards_details) setCards(data.cards_details);
        const url = data?.file
          ? `${process.env.NEXT_PUBLIC_API_URL}/${data.file}`.replace(/\\/g, "/")
          : "/images/landingpage/donate-healing-banner.jpg";
        setBannerPreview(url);
      }
    } catch (err) {
      console.error("Failed to load donate banner", err);
    }
  };


  const handleSaveDonateBanner = async () => {
    try {
      const payload = {
        ...donateData,
        cards_details: cards,
      };

      const res = await updateApiWithFile(
        config.UpdateDonateData,
        "682af5e65f6ed1d63517b87a",
        payload,
        bannerFile ? { file: bannerFile } : {}
      );

      if (res?.statusCode === 200) {
        setShowEditModal(false);
        fetchDonateData();
      }
    } catch (err) {
      console.error("Failed to save donate data", err);
    }
  };


  const updateCardField = (index, field, value) => {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  };

  const removeCard = (index) => {
    const updated = [...cards];
    updated.splice(index, 1);
    setCards(updated);
  };

  const addCard = () => {
    if (cards.length < 3) {
      setCards([...cards, { text: "", description: "" }]);
    }
  };

  const handleSaveProcessDetails = async () => {
    try {
      const payload = { ...processData };
      const fileObj = iconFile ? { icon_file: iconFile } : {};

      const res = await updateApiWithFile(
        config.UpdateDonateData,
        "682af5e65f6ed1d63517b87a",
        payload,
        fileObj
      );

      if (res?.statusCode === 200) {
        setShowProcessModal(false);
        fetchDonateData(); // or similar function to refresh
      }
    } catch (err) {
      console.error("Failed to update process details", err);
    }
  };

  // Handle donation button click
  const handleDonateClick = () => {
    // Check if user is logged in
    if (!userData?._id) {
      setShowLoginPopup(true);
      return;
    }
    setShowDonationModal(true);
  };

  // Handle donation form submission
  const handleDonationSubmit = async (e) => {
    e.preventDefault();
    
    if (!userData?._id) {
      Swal.fire({
        icon: "warning",
        title: "Login Required",
        text: "Please login to make a donation"
      });
      return;
    }

    const amount = parseFloat(donationForm.amount);
    if (!amount || amount <= 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Amount",
        text: "Please enter a valid donation amount greater than 0"
      });
      return;
    }

    setDonationLoading(true);

    try {
      const donationData = {
        user_id: userData._id,
        amount: amount,
        description: donationForm.description || "Donation for Healing",
        message: donationForm.message || ""
      };

      const response = await postApi(config.createDonationPaymentLink, donationData);

      // Check response status - handle nested response structure
      const paymentUrl = response?.data?.paymentUrl || response?.data?.data?.paymentUrl;
      
      if ((response?.statusCode === 201 || response?.statusCode === 200) && paymentUrl) {
        // Redirect to Stripe checkout
        window.location.href = paymentUrl;
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.message || response?.data?.message || "Failed to create payment link. Please try again."
        });
        setDonationLoading(false);
      }
    } catch (error) {
      console.error("Donation error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while processing your donation. Please try again."
      });
      setDonationLoading(false);
    }
  };

  // Handle quick donation with suggested amount
  const handleQuickDonate = async (amount) => {
    if (!userData?._id) {
      setShowLoginPopup(true);
      return;
    }

    setDonationLoading(true);

    try {
      const donationData = {
        user_id: userData._id,
        amount: parseFloat(amount),
        description: "Donation for Healing",
        message: ""
      };

      const response = await postApi(config.createDonationPaymentLink, donationData);

      // Check response status - handle nested response structure
      const paymentUrl = response?.data?.paymentUrl || response?.data?.data?.paymentUrl;
      
      if ((response?.statusCode === 201 || response?.statusCode === 200) && paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.message || response?.data?.message || "Failed to create payment link. Please try again."
        });
        setDonationLoading(false);
      }
    } catch (error) {
      console.error("Donation error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An error occurred while processing your donation. Please try again."
      });
      setDonationLoading(false);
    }
  };



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

  return (
    <>
      {/* <Header arrayheader={arrayheader} /> */}
      {!isOwner ?
        <Header arrayheader={arrayheader} />
        : <h3 className="mt-3 ml-3" style={{ marginLeft: "15px" }}>Donate Healing Page</h3>
      }
      {/* {!isOwner && <SubHeader />} */}
      <div
        className="innerBanner"
        style={{ backgroundImage: `url('${bannerPreview}')` }}
      >
        <div className="container">
          <div className="innerBannertxt">
            {/* <h1>{donateData?.banner_text || "Make A Donation Help In Healing Others"}</h1> */}
            <h1
              dangerouslySetInnerHTML={{
                __html: (donateData?.banner_text || "Job Openings At Vedic")
                  .split(" ")
                  .reduce((acc, word, i) => {
                    const groupIndex = Math.floor(i / 4);
                    acc[groupIndex] = acc[groupIndex] || [];
                    acc[groupIndex].push(word);
                    return acc;
                  }, [])
                  .map(words => words.join(" "))
                  .join("<br />")
              }}
            />
            <button 
              onClick={handleDonateClick}
              className="btn btn-primary mt-3"
            >
              {donateData?.button_label || "Donate Now"}
            </button>
            {isOwner &&
              <button
                className="btn btn-primary mt-3 ms-3"
                onClick={() => setShowEditModal(true)}
              >
                ✏️ Edit Banner
              </button>
            }
          </div>
        </div>
      </div>

      <section className="donateMain">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <div className="donateBx">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <figure className="m-0">
                    <img src="/images/landingpage/become-volunteer-icon.svg" alt="" width={45} />
                  </figure>
                  <span>{cards[0]?.text}</span>
                </div>
                <p className="m-0">
                  {cards[0]?.description}
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="donateBx">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <figure className="m-0">
                    <img src="/images/landingpage/quick-fundraise-icon.svg" alt="" width={45} />
                  </figure>
                  <span>{cards[1]?.text}</span>
                </div>
                <p className="m-0">
                  {cards[1]?.description}
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="donateBx">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <figure className="m-0">
                    <img src="/images/landingpage/start-donating-icon.svg" alt="" width={45} />
                  </figure>
                  <span>{cards[2]?.text}</span>
                </div>
                <p className="m-0">
                  {cards[2]?.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="donateAmount">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <figure className="leftDonate">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${donateData?.icon_file}`.replace(/\\/g, "/")} alt="" />
                <div className="contentImg">
                  <p className="mb-1">
                    {donateData?.process_image_description}
                  </p>
                  <button 
                    onClick={handleDonateClick}
                    className="btn btnDonate"
                  >
                     {donateData?.donate_button_label || "Donatess"} 
                  </button>
                </div>
              </figure>
            </div>
            <div className="col-md-6">
              <div>
                <div className="section-heading">
                  <img src="/images/landingpage/watermark.png" width={50} />
                  <h2>{donateData?.process_title}</h2>
                  <p>
                    {donateData?.process_description}
                  </p>
                </div>
                <ul className="overviewUl donateUl">
                  {donateData?.steps?.map((item, index) => (
                    <li key={index}>
                      <img src="/images/landingpage/right-bg.png" alt="" width={16} className="" />
                      <p className="m-0">
                        {item}
                      </p>
                    </li>
                  ))}

                </ul>
                <p className="text-orange fs-9 my-4">
                  {donateData.note}
                  {/* NOTE: Many insurance companies now reimburse for alternative
                  therapies. Inquire with your insurance provider. */}
                </p>
                <span className="d-flex gap-3">
                  <a
                    type="button"
                    className="btn btn-primary "
                    data-bs-toggle="modal"
                    data-bs-target="#pricelistMdl"
                  >
                    Suggested Donation Amounts
                  </a>
                  {isOwner &&
                    <button
                      className="btn btn-primary "
                      onClick={() => {
                        setProcessData({
                          process_title: donateData?.process_title || "",
                          process_image_description: donateData?.process_image_description || "",
                          process_description: donateData?.process_description || "",
                          steps: donateData?.steps || [""],
                          suggested_amounts: donateData?.suggested_amounts || [{ text: "", price: "" }],
                          suggested_modal_text: donateData?.suggested_modal_text || "",
                          icon_file: donateData?.icon_file || "",
                          note: donateData?.note || "",
                        });
                        setShowProcessModal(true);
                      }}
                    >
                      ✏️ Edit Process Details
                    </button>
                  }
                </span>


              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="modal fade" id="pricelistMdl">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">Price List</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <ul className="priceList mb-2">
                {donateData?.suggested_amounts?.map((item, index) => (
                  <li key={index}>
                    <span>
                      {" "}
                      {item.text} <b>{item.price} and up</b>
                    </span>
                    <button
                      type="button"
                      className="btn btn-sm btn-primary ms-2"
                      onClick={() => handleQuickDonate(item.price)}
                      disabled={donationLoading}
                    >
                      Donate ${item.price}
                    </button>
                  </li>
                ))}

              </ul>
              <p className="fs-8 fst-italic text-black">
                {donateData?.suggested_modal_text}
              </p>
              <div className="text-center py-3">
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showEditModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ minWidth: '600px' }}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Banner Details</h5>
                <button className="btn-close" onClick={() => setShowEditModal(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Banner Text</label>
                  <input
                    className="form-control"
                    value={donateData.banner_text || ""}
                    onChange={(e) =>
                      setDonateData({ ...donateData, banner_text: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Button Label</label>
                  <input
                    className="form-control"
                    value={donateData.button_label || ""}
                    onChange={(e) =>
                      setDonateData({ ...donateData, button_label: e.target.value })
                    }
                  />
                </div>
                 
                <div className="mb-3">
                  <label className="form-label">Button Route</label>
                  <input
                    className="form-control"
                    value={donateData.button_route || ""}
                    onChange={(e) =>
                      setDonateData({ ...donateData, button_route: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setBannerFile(file);
                        setBannerPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {bannerPreview && (
                    <img
                      src={bannerPreview}
                      className="mt-2"
                      style={{ width: "100%", maxHeight: 200, objectFit: "cover" }}
                    />
                  )}
                  <div className="mb-3 mt-3">
                  <label className="form-label">Donate Button Label</label>
                  <input
                    className="form-control"
                    value={donateData.donate_button_label || ""}
                    onChange={(e) =>
                      setDonateData({ ...donateData, donate_button_label: e.target.value })
                    }
                  />
                </div>
                  <h6 className="fw-semibold mt-4 mb-3">Card Details</h6>
                  {cards.map((card, idx) => (
                    <div key={idx} className="border rounded p-3 mb-3">
                      <div className="mb-2">
                        <label className="form-label">Text-{idx + 1}</label>
                        <input
                          className="form-control"
                          value={card.text}
                          onChange={(e) =>
                            updateCardField(idx, "text", e.target.value)
                          }
                        />
                      </div>
                      <div className="mb-2">
                        <label className="form-label">Description-{idx + 1}</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={card.description}
                          onChange={(e) =>
                            updateCardField(idx, "description", e.target.value)
                          }
                        />
                      </div>

                    </div>
                  ))}



                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleSaveDonateBanner}>
                  Save
                </button>
                <button className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showProcessModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{ minWidth: '600px' }}>
              <div className="modal-header">
                <h5 className="modal-title">Edit Process Details</h5>
                <button className="btn-close" onClick={() => setShowProcessModal(false)}></button>
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Process Title</label>
                  <input className="form-control" value={processData.process_title} onChange={(e) =>
                    setProcessData({ ...processData, process_title: e.target.value })} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Icon File</label>
                  <input type="file" className="form-control" onChange={(e) => setIconFile(e.target.files[0])} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Image Description</label>
                  <input className="form-control" value={processData.process_image_description} onChange={(e) =>
                    setProcessData({ ...processData, process_image_description: e.target.value })} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Process Description</label>
                  <textarea className="form-control" value={processData.process_description} onChange={(e) =>
                    setProcessData({ ...processData, process_description: e.target.value })} />
                </div>

                <h6 className="fw-semibold mt-4">Steps</h6>
                {processData.steps.map((step, index) => (
                  <div key={index} className="input-group mb-2">
                    <input
                      className="form-control"
                      value={step}
                      onChange={(e) => {
                        const updatedSteps = [...processData.steps];
                        updatedSteps[index] = e.target.value;
                        setProcessData({ ...processData, steps: updatedSteps });
                      }}
                    />
                    {processData.steps.length > 1 && (
                      <button className="btn btn-danger" onClick={() => {
                        const updatedSteps = processData.steps.filter((_, i) => i !== index);
                        setProcessData({ ...processData, steps: updatedSteps });
                      }}>
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                {processData.steps.length < 8 && (
                  <button className="btn btn-outline-primary mb-3" onClick={() =>
                    setProcessData({ ...processData, steps: [...processData.steps, ""] })}>
                    ➕ Add Step
                  </button>
                )}
                {console.log(processData, "processData.note")}
                <h6 className="fw-semibold mt-4">Note</h6>
                <input className="form-control" value={processData.note} onChange={(e) =>
                  setProcessData({ ...processData, note: e.target.value })} />


                <h6 className="fw-semibold mt-4">Suggested Amounts</h6>
                {processData.suggested_amounts.map((amount, index) => (
                  <div key={index} className="mb-2 border p-2 rounded">
                    <input className="form-control mb-1" placeholder="Text" value={amount.text}
                      onChange={(e) => {
                        const updated = [...processData.suggested_amounts];
                        updated[index].text = e.target.value;
                        setProcessData({ ...processData, suggested_amounts: updated });
                      }} />
                    <input className="form-control" placeholder="Price" value={amount.price}
                      onChange={(e) => {
                        const updated = [...processData.suggested_amounts];
                        updated[index].price = e.target.value;
                        setProcessData({ ...processData, suggested_amounts: updated });
                      }} />
                    {processData.suggested_amounts.length > 1 && (
                      <button className="btn btn-sm btn-danger mt-2"
                        onClick={() => {
                          const updated = processData.suggested_amounts.filter((_, i) => i !== index);
                          setProcessData({ ...processData, suggested_amounts: updated });
                        }}>
                        Delete
                      </button>
                    )}
                  </div>
                ))}
                {processData.suggested_amounts.length < 5 && (
                  <button className="btn btn-outline-primary mb-3" onClick={() =>
                    setProcessData({
                      ...processData,
                      suggested_amounts: [...processData.suggested_amounts, { text: "", price: "" }],
                    })}>
                    ➕ Add Amount
                  </button>
                )}

                <div className="mb-3">
                  <label className="form-label">Modal Text</label>
                  <input className="form-control" value={processData.suggested_modal_text} onChange={(e) =>
                    setProcessData({ ...processData, suggested_modal_text: e.target.value })} />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-primary" onClick={handleSaveProcessDetails}>Save</button>
                <button className="btn btn-secondary" onClick={() => setShowProcessModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Donation Modal */}
      {showDonationModal && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)" }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header border-0">
                <h1 className="modal-title fs-6">Make a Donation</h1>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowDonationModal(false);
                    setDonationForm({ amount: "", description: "", message: "" });
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {donationLoading && <Loader />}
                <form onSubmit={handleDonationSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Donation Amount (USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="form-control"
                      value={donationForm.amount}
                      onChange={(e) =>
                        setDonationForm({ ...donationForm, amount: e.target.value })
                      }
                      required
                      placeholder="Enter amount"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <input
                      type="text"
                      className="form-control"
                      value={donationForm.description}
                      onChange={(e) =>
                        setDonationForm({ ...donationForm, description: e.target.value })
                      }
                      placeholder="Optional description"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={donationForm.message}
                      onChange={(e) =>
                        setDonationForm({ ...donationForm, message: e.target.value })
                      }
                      placeholder="Optional personal message"
                    />
                  </div>
                  <div className="text-center mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary w-75"
                      disabled={donationLoading}
                    >
                      {donationLoading ? "Processing..." : "Proceed to Payment"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary w-75 mt-2"
                      onClick={() => {
                        setShowDonationModal(false);
                        setDonationForm({ amount: "", description: "", message: "" });
                      }}
                      disabled={donationLoading}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Popup */}
      <LoginPopup
        show={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        title="Login Required"
        heading="Please Login"
        description="You need to be logged in to make a donation."
        buttonText="Close"
        onButtonClick={() => {
          setShowLoginPopup(false);
          // Refresh user data after login
          if (typeof window !== "undefined") {
            try {
              const user = JSON.parse(localStorage.getItem("user") || "{}");
              setUserData(user);
            } catch (err) {
              console.error("Error parsing user data:", err);
            }
          }
        }}
      />

      {!isOwner && <FooterSection />}
    </>
  )
}

export default DonateHealing;