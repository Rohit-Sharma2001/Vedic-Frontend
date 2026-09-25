"use client";
import { useState, useEffect, useRef } from "react";
import Header from "app/(landingpage)/LandingPage/components/Header/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import "app/(landingpage)/LandingPage/public/css/style.css";
import { config } from "services/config";
import { postApi } from "services/api";
import Loader from "services/Loader/page";
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const JoinYogaClasses = () => {
    const router = useRouter();
    const videosRef = useRef(null);
const pathname = usePathname();

const goToSchedule = () => {
  router.push("/YogaClasses/components/YogaClassSchedule");
};
    const [yogaVideo, setYogaVideo] = useState()
    const [loader, setLoader] = useState(false)
    const [benarDetails, setBenarDetails] = useState()
    const [imagePreview, setImagePreview] = useState()
    const arrayheader = [
        { name: "Schedule", route: "/LandingPage/components/AmitaHome" },
        { name: "Classes", route: "/YogaClasses/components/JoinYogaClasses" },
        { name: "Tutorials", route: "/tutorials" },
        { name: "Gallery", route: "/LandingPage/components/Gallery" },

    ];

    useEffect(() => { getVideos(), banerDetails() }, [])

    const getVideos = async () => {
        try {
            console.log('response')
            const endpoint = config.getAllYogaVideo;
            //   const data = {
            //     // page: 1,
            //     user: user._id,
            //     // pageSize: 10,
            //     product: id,
            //     selected: 1,
            //   };
            const response = await postApi(endpoint);
            if (response.statusCode == 201) { setYogaVideo(response.result) }
        } catch (err) {

        }
    }
    const banerDetails = async () => {
        try {
            console.log('response')
            const endpoint = config.category;
            const data = {
                dropdown_type: 'yoga_video_banner'
            };
            const response = await postApi(endpoint, data);
            console.log(response, "responseresponse")
            if (response.statusCode == 200) {
                const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/${response.result[0]?.file}`.replace(/\\/g, '/');
                setImagePreview(imageUrl);
                setBenarDetails(response.result[0])
            }
        } catch (err) {

        }
    }
    const changeRoute = (id) => {
        router.push(`/YogaClasses/components/videoDetails/${id}`)
    }

    return (
        <>
           {!pathname.includes("view-Business") && <Header arrayheader={arrayheader} />}
          {/* {!pathname.includes("view-Business") &&  <SubHeader />} */}
            {loader && <Loader />}
            {!pathname.includes("view-Business") &&
            <div
                className="innerBanner"
                style={{ backgroundImage: `url(${`${imagePreview}`})` }}
            >
                <div className="container-fluid">
                    <div className="innerBannertxt">
                        <h1>{benarDetails && benarDetails?.name}</h1>
                        <p>{benarDetails && benarDetails?.description}</p>
                        <button 
  type="button" 
  className="btn btn-primary"
  onClick={goToSchedule}
>
  Join Classes
</button>

                    </div>
                </div>
            </div>
}

            {/* ---------------------------------content--------------------------------------------- */}


        <div className="programSection mt-4" ref={videosRef}>

                <div className="container-fluid">
                 {yogaVideo &&
  yogaVideo.length > 0 &&
  yogaVideo
    .filter((e) => e.status === 1) // ✅ Only show active categories
    .map((e, ind) => 

                        <div key={ind}>
                            <div className="d-md-flex justify-content-between mb-md-4 align-items-end mb-3">
                                <div className="section-heading text-start mw-100 mx-0 pb-3 pb-md-0">
                                    <img src="/images/landingpage/watermark.png" width="50" />
                                    <h2>{e.name}</h2>
                                    <p>{e.description}</p>
                                </div>
                                <Link href={`/YogaClasses/components/AllYoga/${e._id}`} className="btn btn-primary">View All</Link>
                            </div>

                            <div className="row">
{e.videos
  ?.filter((video) => video.status === 1) // ✅ show only active videos
  .map((video, index) => (

                                        <div className="col-md-4 col-xl-3 mb-4" style={{cursor:'pointer'}} onClick={() => changeRoute(video._id)} key={video._id || index}>
                                            <div className="instituteTxt">
                                                <figure className="position-relative" >
                                                    <img
                                                        src={video.coverImage ? `${process.env.NEXT_PUBLIC_API_URL}/${video.coverImage}` : "/images/landingpage/kids-yoga-fitness.jpg"}
                                                        alt={video.name || "Yoga video"}
                                                    />
                                                </figure>
                                                <h3>{video.name}</h3>
                                                {/* <p className="mb-2">{video.description}</p> */}
                                                <div className="mb-2" dangerouslySetInnerHTML={{ __html: video.description }}></div>
                                                <div className="d-flex gap-1 align-items-center mb-2">
                                                    <span className="fs-9 d-flex gap-1 align-items-center pe-1">
                                                        <img
                                                            src="/images/landingpage/clock-img.svg"
                                                            alt=""
                                                            width="13"
                                                        />{" "}
                                                        {video.duration} min
                                                    </span>{" "}
                                                    |
                                                    <span className="fs-9 d-flex gap-1 align-items-center ps-1">
                                                        <img
                                                            src="/images/landingpage/user-img.svg"
                                                            alt=""
                                                            width="13"
                                                        />{" "}
                                                        {video.employee?.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                        </div>
                    )}
                  
                </div>
            </div>
        {!pathname.includes("view-Business") &&    <FooterSection />}
        </>
    );
};

export default JoinYogaClasses;
