"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "app/(landingpage)/LandingPage/components/Header/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import "app/(landingpage)/LandingPage/public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import flatpickr from "flatpickr";
import { checkIsOwner } from "services/config";
import "flatpickr/dist/flatpickr.min.css";
import '../../../../../../app/(landingpage)/LandingPage/public/css/style.css'
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
import { useRouter } from 'next/navigation';
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";
const AllYogaClasses = ({ params }) => {
    const id = params.viewid;
    const router = useRouter();
    const [categoryData, setCatetoryData] = useState([]);

    useEffect(() => {
        if (id) {
            fetchEventDetails();
        }
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            const endpoint = config.yogaCatVideoById;
            const data = { categoryId: id };
            const response = await postApi(endpoint, data);

            console.log("yoga Details:", response);

            if (response.statusCode === 201 || response.statusCode === 200) {
                setCatetoryData(response.result[0]);
            }
        } catch (error) {
            console.error("Error fetching yoga details:", error);
        }
    };
    const arrayheader = [
        { name: "Schedule", route: "/LandingPage/components/AmitaHome" },
        { name: "Classes", route: "/YogaClasses/components/JoinYogaClasses" },
        { name: "Tutorials", route: "/tutorials" },
        { name: "Gallery", route: "/LandingPage/components/Gallery" },

    ];
    const changeRoute = (id) => {
        router.push(`/YogaClasses/components/videoDetails/${id}`)
    }
    return (
        <>
            <Header arrayheader={arrayheader} />
            {/* <SubHeader /> */}
            <section className="yogaclassSection deatilMain mt-0">
                <div className="container-fluid">
                    <div className="breadcrumbGroup my-4 mb-md-3 mt-0">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link href={'/YogaClasses/components/JoinYogaClasses'} style={{textDecoration:'none'}}>Yoga Classes </Link></li>
                          
                            <li className="breadcrumb-item active" aria-current="page">{categoryData?.name}</li>
                        </ol>
                    </div>
                    <>
                        <div className="mb-md-4">
                            <div className="section-heading text-start mw-100 mx-0 pb-4 pb-md-0">
                                <img src="/images/landingpage/watermark.png" width="50" />
                                <h2>{categoryData?.name}</h2>
                                <p>{categoryData?.description}</p>
                            </div>
                        </div>
                        <div className="row">
                            {categoryData && categoryData.videos && categoryData.videos.map((video, ind) =>
                                <div key={ind} onClick={() => changeRoute(video._id)} className="col-md-4 col-xl-3 mb-4">
                                    <div className="instituteTxt">
                                        <figure className="position-relative">
                                            <img src={video.coverImage ? `${process.env.NEXT_PUBLIC_API_URL}/${video.coverImage}` : "/images/landingpage/kids-yoga-fitness.jpg"} />
                                        </figure>
                                        <h3>{video.name}</h3>
                                        {/* <p className="mb-2">{video.description}</p> */}
                                        <div className="mb-2" dangerouslySetInnerHTML={{ __html: video?.description }}></div>
                                        <div className="d-flex gap-1 align-items-center mb-2">
                                            <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img src="/images/landingpage/clock-img.svg"
                                                alt="" width="13" /> {video?.duration} min</span> |
                                            <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img src="/images/landingpage/user-img.svg"
                                                alt="" width="13" /> {video?.employee?.name}</span>
                                        </div>
                                    </div>
                                </div>)}
                            {/* <div className="col-md-4 col-xl-3 mb-4">
                                <div className="instituteTxt">
                                    <figure className="position-relative">
                                        <img src="/images/landingpage/surya-namaskar.jpg" />
                                    </figure>
                                    <h3>Surya Namaskar: Practice & Form</h3>
                                    <p className="mb-2">Learn sun salutations and focus on form, precision, breath and timing. Required
                                        before Hatha classes.</p>
                                    <div className="d-flex gap-1 align-items-center mb-2">
                                        <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img src="/images/landingpage/clock-img.svg"
                                            alt="" width="13" /> 44 min</span> |
                                        <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img src="/images/landingpage/user-img.svg"
                                            alt="" width="13" /> Amita Jain</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-xl-3 mb-4">
                                <div className="instituteTxt">
                                    <figure className="position-relative">
                                        <img src="/images/landingpage/trataka-candle-meditation.jpg" />
                                    </figure>
                                    <h3>Trataka Candle Meditation</h3>
                                    <p className="mb-2">Strengthen eyesight naturally and open the third eye of wisdom, creativity, and
                                        intuition. Held once per season.</p>
                                    <div className="d-flex gap-1 align-items-center mb-2">
                                        <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img src="/images/landingpage/clock-img.svg"
                                            alt="" width="13" /> 44 min</span> |
                                        <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img src="/images/landingpage/user-img.svg"
                                            alt="" width="13" /> Amita Jain</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-xl-3 mb-4">
                                <div className="instituteTxt">
                                    <figure className="position-relative">
                                        <img src="/images/landingpage/trataka-candle-meditation.jpg" />
                                    </figure>
                                    <h3>Trataka Candle Meditation</h3>
                                    <p className="mb-2">Strengthen eyesight naturally and open the third eye of wisdom, creativity, and
                                        intuition. Held once per season.</p>
                                    <div className="d-flex gap-1 align-items-center mb-2">
                                        <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img src="/images/landingpage/clock-img.svg"
                                            alt="" width="13" /> 44 min</span> |
                                        <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img src="/images/landingpage/user-img.svg"
                                            alt="" width="13" /> Amita Jain</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-xl-3 mb-4">
                                <div className="instituteTxt">
                                    <figure className="position-relative">
                                        <img src="/images/landingpage/kids-yoga-fitness.jpg" />
                                    </figure>
                                    <h3>Kids Yoga & Fitness</h3>
                                    <p className="mb-2">For kids, with kids, led by kids. A fun class that will get your children to
                                        love Yoga at an early age.</p>
                                    <div className="d-flex gap-1 align-items-center mb-2">
                                        <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img src="/images/landingpage/clock-img.svg"
                                            alt="" width="13" /> 44 min</span> |
                                        <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img src="/images/landingpage/user-img.svg"
                                            alt="" width="13" /> Amita Jain</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-xl-3 mb-4">
                                <div className="instituteTxt">
                                    <figure className="position-relative">
                                        <img src="/images/landingpage/surya-namaskar.jpg" />
                                    </figure>
                                    <h3>Surya Namaskar: Practice & Form</h3>
                                    <p className="mb-2">Learn sun salutations and focus on form, precision, breath and timing. Required
                                        before Hatha classes.</p>
                                    <div className="d-flex gap-1 align-items-center mb-2">
                                        <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img src="/images/landingpage/clock-img.svg"
                                            alt="" width="13" /> 44 min</span> |
                                        <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img src="/images/landingpage/user-img.svg"
                                            alt="" width="13" /> Amita Jain</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-xl-3 mb-4">
                                <div className="instituteTxt">
                                    <figure className="position-relative">
                                        <img src="/images/landingpage/kids-yoga-fitness.jpg" />
                                    </figure>
                                    <h3>Kids Yoga & Fitness</h3>
                                    <p className="mb-2">For kids, with kids, led by kids. A fun class that will get your children to
                                        love Yoga at an early age.</p>
                                    <div className="d-flex gap-1 align-items-center mb-2">
                                        <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img src="/images/landingpage/clock-img.svg"
                                            alt="" width="13" /> 44 min</span> |
                                        <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img src="/images/landingpage/user-img.svg"
                                            alt="" width="13" /> Amita Jain</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-xl-3 mb-4">
                                <div className="instituteTxt">
                                    <figure className="position-relative">
                                        <img src="/images/landingpage/surya-namaskar.jpg" />
                                    </figure>
                                    <h3>Surya Namaskar: Practice & Form</h3>
                                    <p className="mb-2">Learn sun salutations and focus on form, precision, breath and timing. Required
                                        before Hatha classes.</p>
                                    <div className="d-flex gap-1 align-items-center mb-2">
                                        <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img src="/images/landingpage/clock-img.svg"
                                            alt="" width="13" /> 44 min</span> |
                                        <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img src="/images/landingpage/user-img.svg"
                                            alt="" width="13" /> Amita Jain</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-xl-3 mb-4">
                                <div className="instituteTxt">
                                    <figure className="position-relative">
                                        <img src="/images/landingpage/trataka-candle-meditation.jpg" />
                                    </figure>
                                    <h3>Trataka Candle Meditation</h3>
                                    <p className="mb-2">Strengthen eyesight naturally and open the third eye of wisdom, creativity, and
                                        intuition. Held once per season.</p>
                                    <div className="d-flex gap-1 align-items-center mb-2">
                                        <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img src="/images/landingpage/clock-img.svg"
                                            alt="" width="13" /> 44 min</span> |
                                        <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img src="/images/landingpage/user-img.svg"
                                            alt="" width="13" /> Amita Jain</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-xl-3 mb-4">
                                <div className="instituteTxt">
                                    <figure className="position-relative">
                                        <img src="/images/landingpage/trataka-candle-meditation.jpg" />
                                    </figure>
                                    <h3>Trataka Candle Meditation</h3>
                                    <p className="mb-2">Strengthen eyesight naturally and open the third eye of wisdom, creativity, and
                                        intuition. Held once per season.</p>
                                    <div className="d-flex gap-1 align-items-center mb-2">
                                        <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img src="/images/landingpage/clock-img.svg"
                                            alt="" width="13" /> 44 min</span> |
                                        <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img src="/images/landingpage/user-img.svg"
                                            alt="" width="13" /> Amita Jain</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-xl-3 mb-4">
                                <div className="instituteTxt">
                                    <figure className="position-relative">
                                        <img src="/images/landingpage/kids-yoga-fitness.jpg" />
                                    </figure>
                                    <h3>Kids Yoga & Fitness</h3>
                                    <p className="mb-2">For kids, with kids, led by kids. A fun class that will get your children to
                                        love Yoga at an early age.</p>
                                    <div className="d-flex gap-1 align-items-center mb-2">
                                        <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img src="/images/landingpage/clock-img.svg"
                                            alt="" width="13" /> 44 min</span> |
                                        <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img src="/images/landingpage/user-img.svg"
                                            alt="" width="13" /> Amita Jain</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 col-xl-3 mb-4">
                                <div className="instituteTxt">
                                    <figure className="position-relative">
                                        <img src="/images/landingpage/surya-namaskar.jpg" />
                                    </figure>
                                    <h3>Surya Namaskar: Practice & Form</h3>
                                    <p className="mb-2">Learn sun salutations and focus on form, precision, breath and timing. Required
                                        before Hatha classes.</p>
                                    <div className="d-flex gap-1 align-items-center mb-2">
                                        <span className="fs-9 d-flex gap-1 align-items-center pe-1"><img src="/images/landingpage/clock-img.svg"
                                            alt="" width="13" /> 44 min</span> |
                                        <span className="fs-9 d-flex gap-1 align-items-center ps-1"><img src="/images/landingpage/user-img.svg"
                                            alt="" width="13" /> Amita Jain</span>
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </>
                </div>
            </section>
            <FooterSection />



        </>
    );
};
export default AllYogaClasses;
