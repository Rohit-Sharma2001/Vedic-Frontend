 "use client";
import { useState, useEffect, useRef } from "react";

import { useParams } from "next/navigation";
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";



const Memberships = ({setSelecetedMembership}) => {
    const [plans, setPlans] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [itemTypeList, setItemTypeList] = useState([]);
    const [userMembershipId, setUserMembershipId] = useState(null);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("user"));
        setUserMembershipId(user?.membershipId || null);
    }, []);

    const [imagePreview, setImagePreview] = useState(null);
    useEffect(() => {
        // Only run this on the client
        if (typeof window !== "undefined") {
            import("bootstrap/dist/js/bootstrap.bundle.min.js")
                .then(() => {

                })
                .catch((err) => console.error("Failed to load Bootstrap JS", err));
        }
    }, []);

    const arrayheader = [
        { name: "Home", route: "/" },
        { name: "Book Online", route: "/Appointment/components/BookAppointment" },
        { name: "Order", route: "/profile?tab=orders" },
        { name: "Yoga ", route: "/YogaClasses/components/JoinYogaClasses" },
        { name: "Event", route: "/Events" },
        {
            name: "Resources",
            route: "/LandingPage/components/Quiz",
            children: [
                { name: "Dosha Quiz", route: "/LandingPage/components/Quiz" },
                { name: "Health Articles", route: "/LandingPage/components/BookArticles" },
                { name: "Gallery", route: "/LandingPage/components/Gallery" },

            ]
        },
    ];


    useEffect(() => {
        fetchPlans(currentPage);
    }, [currentPage]);

    const fetchPlans = async (page) => {
        try {
            const response = await postApi(config.GetMembershipPlans, { page, pageSize });

            setPlans(response.result || []);
            setTotalPages(response.totalPages || 1);
        } catch (error) {
            console.error("Error fetching plans:", error);
        }
    };

    useEffect(() => {
        fetchItemTypes(currentPage);

    }, [currentPage]);
    const fetchItemTypes = async (page) => {
        try {
            const endpoint = config.category;
            const data = { dropdown_type: "membershippage_banner", page, pageSize };
            const response = await postApi(endpoint, data);

            setItemTypeList(response.result || []);
            const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/${response.result[0]?.file}`.replace(/\\/g, '/');
            setImagePreview(imageUrl);
            setTotalPages(response.totalPages || 1);
        } catch (error) { console.error('Error fetching product types:', error); }
    };


    return (
        <>

            {/* <div className="innerBanner" 
    
    //  style={{ backgroundImage: `url('${"/images/landingpage/memberships-banner.jpg"}')` }}
      style={{ backgroundImage: `url(${imagePreview})`, }}
     >
        <div className="container">
            <div className="innerBannertxt">
                <h1>{itemTypeList[0]?.name || 'Memberships'}</h1>
                <p>{itemTypeList[0]?.description || 'Save on the classes and services we offer with a package.'}</p>
            </div>
        </div>
    </div> */}

            {/* -------------------------------------------------------------Content------------------------------------------ */}

            {/* <section className="monthPlan mt-4">
        <div className="container-fluid">
            <div className="breadcrumbGroup my-2 mb-md-3 mt-0">
                <ol className="breadcrumb mb-0">
                    <li className="breadcrumb-item"><Link style={{textDecoration:'none'}} href={'/Appointment/components/BookAppointment'}>Booking Page</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Membership</li>
                </ol>
            </div> */}


            <div className="row justify-content-md-center">
                {plans[0]?.status == 1 && plans[0]?._id !== userMembershipId &&
                    <div className="col-md-6 col-lg-4 pe-md-3 mb-3">
                        <div className="monthInner h-100">
                            <div className="bgImg">
                                <lottie-player src="/images/landingpage/women-1.json" loop autoplay></lottie-player>
                            </div>
                            {plans[0]?.is_bestvalue === 1 && <span className="bestValue">Best Value</span>}
                            <h5>${plans[0]?.price} <span> /Per person per month</span></h5>
                            <strong>{plans[0]?.plan_name}</strong>
                            <hr />
                            {plans[0]?.plan_details?.length > 0 && (
                                <ul className="PlanlistUl pt-2">
                                    {plans[0].plan_details.map((detail, index) => (
                                        <li key={index}>
                                            <img
                                                src="/images/landingpage/Icon-check.svg"
                                                alt=""
                                                width="14"
                                            />
                                            {detail?.title}
                                        </li>
                                    ))}
                                </ul>
                            )}


                            <div className="enrollMain">
                                <button onClick={() => setSelecetedMembership(plans[0])} className="btn btn-primary px-5">Enroll</button>
                                {/* <Link href={`/Memberships/Membership-Details/${plans[0]?._id}`} className="btn btn-primary px-5">Enroll</Link> */}
                            </div>
                        </div>
                    </div>
                }

                {plans[1]?.status == 1 && plans[1]?._id !== userMembershipId &&
                    <div className="col-md-6 col-lg-4 ps-md-3 mb-3">
                        <div className="monthInner bg-blue h-100">
                            <div className="bgImg">
                                <lottie-player src="/images/landingpage/woman-2.json" loop autoplay></lottie-player>
                            </div>
                            {plans[1]?.is_bestvalue === 1 && <span className="bestValue">Best Value</span>}
                            <h5>${plans[1]?.price} <span> /Per person per month</span> </h5>
                            <strong>{plans[1]?.plan_name}</strong>
                            <hr />
                            {plans[1]?.plan_details?.length > 0 && (
                                <ul className="PlanlistUl pt-2">
                                    {plans[1].plan_details.map((detail, index) => (
                                        <li key={index}>
                                            <img
                                                src="/images/landingpage/Icon-check.svg"
                                                alt=""
                                                width="14"
                                            />
                                            {detail?.title}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="enrollMain">
                                <button onClick={() => setSelecetedMembership(plans[1])} className="btn btn-primary px-5">Enroll</button>

                                {/* <Link href={`/Memberships/Membership-Details/${plans[1]?._id}`} className="btn btn-primary px-5">Enroll</Link> */}
                            </div>
                        </div>
                    </div>
                }
                {plans[2]?.status == 1 && plans[2]?._id !== userMembershipId &&
                    <div className="col-md-6 col-lg-4 ps-md-3 mb-3">
                        <div className="monthInner h-100" style={{ backgroundColor: '#B7FFD7' }}>
                            <div className="bgImg">
                                <lottie-player src="/images/landingpage/woman-3.json" loop autoplay></lottie-player>
                            </div>
                            {plans[2]?.is_bestvalue === 1 && <span className="bestValue">Best Value</span>}
                            <h5>${plans[2]?.price} <span> /Per person per month</span></h5>
                            <strong>{plans[2]?.plan_name}</strong>
                            <hr />
                            {plans[2]?.plan_details?.length > 0 && (
                                <ul className="PlanlistUl pt-2">
                                    {plans[2].plan_details.map((detail, index) => (
                                        <li key={index}>
                                            <img
                                                src="/images/landingpage/Icon-check.svg"
                                                alt=""
                                                width="14"
                                            />
                                            {detail?.title}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <div className="enrollMain">
                                <button onClick={() => setSelecetedMembership(plans[2])} className="btn btn-primary px-5">Enroll</button>
                            </div>
                        </div>
                    </div>
                }
            </div>
            
            {/* </div>
    </section> */}

            {/* <FooterSection /> */}
        </>
    );
};
export default Memberships;
