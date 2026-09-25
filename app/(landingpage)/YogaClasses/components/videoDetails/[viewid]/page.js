"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "app/(landingpage)/LandingPage/components/Header/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import "app/(landingpage)/LandingPage/public/css/style.css";
import flatpickr from "flatpickr";
import { checkIsOwner } from "services/config";
import "flatpickr/dist/flatpickr.min.css";
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
import { usePathname, useRouter } from 'next/navigation';
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
import VimeoPreview from "services/Reusable/Vimeoplayer";
const ClickSubscribe = ({ params }) => {
    const router = useRouter()
    const id = params.viewid;
    const arrayheader = [
        { name: "Schedule", route: "/LandingPage/components/AmitaHome" },
        { name: "Classes", route: "/YogaClasses/components/JoinYogaClasses" },
        { name: "Tutorials", route: "/tutorials" },
        { name: "Gallery", route: "/LandingPage/components/Gallery" },

    ];
    const [videoData, setVideoData] = useState([]);

    useEffect(() => {
        if (id) {
            fetchEventDetails();
        }
    }, [id]);

    const fetchEventDetails = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        try {
            const endpoint = config.findYogaVideoById;
            const data = { videoId: id, user_id: user?._id };
            const response = await postApi(endpoint, data);


            if (response.statusCode === 201 || response.statusCode === 200) {
                let data = response.result[0]
                data.isPurchased = response?.isPurchased
                // console.log("video detaila", data)/
                setVideoData(data);
            }
        } catch (error) {
            console.error("Error fetching yoga details:", error);
        }
    };

    const routeToRelatedVideo = (id) => {
        router.push(`/YogaClasses/components/videoDetails/${id}`)
    }
    return (
        <>
            <Header arrayheader={arrayheader} />
            {/* <SubHeader /> */}
            <section className="deatilMain mt-0">
                <div className="container-fluid">
                    <div className="breadcrumbGroup my-4 mb-md-3 mt-0">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link href={'/YogaClasses/components/JoinYogaClasses'}>Yoga Classes </Link></li>
                            <li className="breadcrumb-item"><Link href={`/YogaClasses/components/AllYoga/${videoData?.categoryId}`}>{videoData?.categoryName} </Link></li>
                            <li className="breadcrumb-item active" aria-current="page">Detail Page</li>
                        </ol>
                    </div>
                    <div className="row">
                        <div className="col-lg-8 mb-3">
                            <div className="subscribeClick mb-4">


                             {/* <video  */}
                             
                                    {/* //     style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "15px" }}
                                    //     controls
                                    // >
                                    //     <source src={ videoData.video } type="video/mp4" />
                                    // </video>
                                    // <iframe
                                    //     style={{
                                    //         width: "100%",
                                    //         height: "400px",
                                    //         objectFit: "cover",
                                    //         borderRadius: "15px",
                                    //         border: "none" // optional to remove iframe border
                                    //     }}
                                    //     src={videoData.video}
                                    //     title="YouTube video player"
                                    //     frameBorder="0"
                                    //     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    //     allowFullScreen
                                    // ></iframe>   */}
                                {videoData.video && (
                                    <VimeoPreview
                                        videoId={videoData.video}
                                        previewTime={
                                            videoData.is_exclusive
                                                ? videoData.isPurchased
                                                    ? 0 // full video for purchased users
                                                    : 30 // 30s preview for non-purchased users
                                                : 0 // full video for non-exclusive videos
                                        }
                                        controls={
                                            videoData.is_exclusive
                                                ? videoData.isPurchased
                                                    ? true // allow controls if purchased
                                                    : false // hide controls during preview
                                                : true // always allow controls for non-exclusive videos
                                        }

                                    />
                                )}


                                {videoData.is_exclusive && !videoData.isPurchased && (
                                    <div className="subscribeBottom">
                                        <p>Subscribe to enjoy full access to yoga classes.</p>
                                        <Link href={"/Memberships"} className="btn btnSubscribe">Subscribe</Link>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 descriptionSection">
                                <h3 className="mb-1 fs-5 fw-semibold">{videoData.name}</h3>
                                {/* <p className="fs-8">{videoData.description}</p> */}
                                <div className="fs-8" dangerouslySetInnerHTML={{ __html: videoData.description }}></div>
                                <strong className="mb-2 d-block mt-md-4 mt-3">About the class</strong>
                                <ul className="aboutClass mb-4">
                                    <li><b> Duration:</b> {videoData.duration || 0} min</li>
                                    <li><b> Teacher: </b> {videoData?.employee?.name || ""}</li>
                                    <li><b> Level: </b> {videoData?.level?.name || ""}</li>
                                </ul>
                                <strong className="mb-3 d-block">About Instructor</strong>
                                <div className="spkerDetail mb-3">
                                    <figure className="m-0">
                                        <img src={videoData?.employee?.file?`${process.env.NEXT_PUBLIC_API_URL}/${videoData?.employee?.file}`:"/images/landingpage/speker-img.jpg"} alt={videoData?.employee?.name} />
                                    </figure>
                                    <span>{videoData?.employee?.name} <b> {videoData?.employeeData?.expertise}
                                        {/* Doctor of Ayurveda, Certified Hatha Yoga Instructor Founder, Vedic
                                        Health and
                                        Vedic Yoga */}
                                        </b></span>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-4 mb-3">
                            <div className="relatedsecRight">
                                <h3 className="fs-6 fw-semibold">Related Videos</h3>
                                <ul>
                                   
                                    {videoData && videoData?.relatedVideo?.length > 0 && videoData.relatedVideo.map((rel, index) =>
                                        <li onClick={() => routeToRelatedVideo(rel._id)} key={index}>
                                            <figure className="m-0">
                                                <img 
                                                 src={`${process.env.NEXT_PUBLIC_API_URL}/${rel.coverImage}` }
                                                alt={rel.name || "Yoga video"} />
                                            </figure>
                                            <div>
                                                <h6>{rel.name}</h6>
                                                <div className="d-flex gap-1 align-items-center mb-2">
                                                    <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img
                                                        src="/images/landingpage/clock-img.svg" alt="" width="13" /> {rel?.duration} min</span> |
                                                    <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img
                                                        src="/images/landingpage/user-img.svg" alt="" width="13" />{rel.employee?.name}</span>
                                                </div>
                                            </div>
                                        </li>)}

                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <FooterSection />



        </>
    );
};
export default ClickSubscribe;
