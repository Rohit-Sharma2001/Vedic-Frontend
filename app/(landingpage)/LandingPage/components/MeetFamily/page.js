"use client";
import React, { useEffect, useState } from "react";
import Header from "../Header/page";
import InnerBanner from "../AmitajainInnerBanner/page";
import AboutAmitaJain from "../AboutAmitaJain/page";
import BackgroundOfHer from "../BackgroundOfHer/page";
import SendANoteToAmita from "../SendANoteToAmita/page";
import BhagavadGitaQuote from "../BhagavadGitaQuote/page";
import FooterSection from "../Footer/page";
import { postApi ,updateApiWithFile ,getApi} from "services/api";
import { config } from "services/config";
import '../../public/css/style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { checkIsOwner } from "services/config";
import Link from "node_modules/next/link";
import { usePathname } from 'next/navigation';
// import SubHeader from "../SubHeader/page";
const MeetFamily = () => {
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

const [familyData, setFamilyData] = useState({});
const [imagePreview, setImagePreview] = useState(null);
const [file, setFile] = useState(null);
const [showModal, setShowModal] = useState(false);
 const [currentPage, setCurrentPage] = useState(1);
 const [team ,setTeam] =useState([])
useEffect(() => {
  window.scrollTo(0, 0);
  fetchFamilyBanner();
  fetchData(currentPage)
}, []);

const fetchData = async (page) => {
  try {
    const res = await postApi(config.GetEmployee, {}); // Use postApi like YogaCourses
    const allData = res?.data?.employeeData || [];
    console.log("Employee Data:", allData);
    setTeam(allData); // store employeeData in team
  } catch (err) {
    console.error("Failed to fetch employee data:", err);
  }
};

const fetchFamilyBanner = async () => {
  try {
    const res = await postApi(config.GetOurFamilyBanner, { id: "682ae1df3d7a8c7cf34ec76a" });
    const data = res?.data;
    if (data) {
      setFamilyData(data);
      const banner = data?.file
        ? `${process.env.NEXT_PUBLIC_API_URL}/${data.file}`.replace(/\\/g, "/")
        : "/images/landingpage/family-banner.jpg";
      setImagePreview(banner);
    }
  } catch (err) {
    console.error("Failed to load family banner", err);
  }
};



const handleFamilySave = async () => {
  try {
    const res = await updateApiWithFile(
      config.UpdateOurFamilyBanner,
      "682ae1df3d7a8c7cf34ec76a",
      familyData,
      file ? { file } : {}
    );
    if (res?.statusCode === 200) {
      setShowModal(false);
      fetchFamilyBanner();
    }
  } catch (err) {
    console.error("Failed to update family data", err);
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
      :<h3 className="mt-3 ml-3" style={{marginLeft:"15px"}}>Meet Family Page</h3>
    }
 {/* {!isOwner && <SubHeader />} */}
            <>
               <div
  className="innerBanner"
  style={{ backgroundImage: `url('${imagePreview}')` }}
>
  <div className="container">
    <div className="innerBannertxt">
      <h1>{familyData?.title || "Meet Our Family"}</h1>
      <p>{familyData?.subtitle || "Practitioners & Healers"}</p>
      {isOwner && 
      <button
        className="btn btn-primary mt-3"
        onClick={() => setShowModal(true)}
      >
        ✏️ Edit Banner
      </button>
      }
    </div>
  </div>
</div>
<div className="d-flex justify-content-center mt-5">
  {isOwner &&<>
                 <div className="d-flex gap-3">
                 <Link href={'/admin/users/Practioners'} target="_parent"  className="btn btn-primary mr-3"><b>+</b> Manage Team </Link>
                 
                 </div>
                 </>}
                 </div>

                {team.map((member, index) => {
  const isEven = index % 2 === 0;
  const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/${member?.user?.file}`.replace(/\\/g, '/');

  return (
    <section className={`introPeople ${isEven ? 'bg-white py-2' : ''}`} key={member._id}>
      <div className="container-fluid">
        <div className={`row ${!isEven ? 'flex-row-reverse' : ''}`}>
          <div className="col-lg-4">
            <figure className={`imageIntro ${!isEven ? 'rightBg' : ''} m-0`}>
              <img src={imageUrl} alt={member?.user?.name} />
            </figure>
          </div>
          <div className="col-lg-8">
            <div className={`${isEven ? 'ps-lg-4' : 'pe-lg-4'} IntroTxt`}>
              <h6>{member?.user?.name || 'N/A'}</h6>
              <span>{member?.expertise  || 'N/A'}</span>
              {/* <p className="mb-2">{member?.description}</p> */}
                <p  className="mb-2" dangerouslySetInnerHTML={{ __html: member?.description ? member?.description : 'N/A'}}></p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
})}

            </>


{showModal && (
  <div className="modal show d-block" tabIndex="-1">
    <div className="modal-dialog modal-lg">
      <div className="modal-content"style={{minWidth:'600px'}}>
        <div className="modal-header">
          <h5 className="modal-title">Edit Banner Content</h5>
          <button className="btn-close" onClick={() => setShowModal(false)}></button>
        </div>
        <div className="modal-body">
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              className="form-control"
              value={familyData.title || ""}
              onChange={(e) => setFamilyData({ ...familyData, title: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Subtitle</label>
            <input
              className="form-control"
              value={familyData.subtitle || ""}
              onChange={(e) => setFamilyData({ ...familyData, subtitle: e.target.value })}
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
                  setFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2"
                style={{ width: "100%", maxHeight: 200, objectFit: "cover" }}
              />
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={handleFamilySave}>
            Save
          </button>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
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

export default MeetFamily;