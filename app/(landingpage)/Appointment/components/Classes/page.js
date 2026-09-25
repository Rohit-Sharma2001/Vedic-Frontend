"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "app/(landingpage)/LandingPage/components/Header/page";
import FooterSection from "app/(landingpage)/LandingPage/components/Footer/page";
import "app/(landingpage)/LandingPage/public/css/style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { config } from "services/config";
import { postApi, postApiWithFile, updateApiWithFile } from "services/api";
// import SubHeader from "app/(landingpage)/LandingPage/components/SubHeader/page";

const Classes = () => {
   
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
      <Header arrayheader={arrayheader} />
        {/* <SubHeader /> */}
    <div className="deatilMain mb-4 mb-md-5">
        <div className="container-fluid">
            <div className="section-heading mw-100 text-start">
                <img src="/images/landingpage/watermark.png" width="50"/>
                <h2>Classes</h2>
                <p className="mb-0">Lorem Ipsum Simply Dummy Text for typesetting industry</p>
            </div>
            <div className="row MembershipJoin mb-4 m-0">
                <div className="col-md-10 mb-md-0 mb-3">
                    <div className="d-flex align-items-center gap-3">
                        <figure className="m-0">
                            <lottie-player src="/images/landingpage/laurel-wreath.json" loop autoplay
                               
                                 style={{width:"80px",height:"80px"}} ></lottie-player>
                        </figure>
                        <div className="">
                            <h6 className="mb-1 fw-semibold fs-6">Join Membership</h6>
                            <p className="fs-8 m-0">Lorem Ipsum is simply dummy text of the printing and typesetting
                                industry.
                                Lorem
                                Ipsum has
                                been
                                the industry standard dummy text ever since the 1500s</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-2 text-md-end">
                    <button className="btn btn-primary" type="button" data-bs-toggle="collapse"
                        data-bs-target="#collapseOne">Join
                        Now</button>
                </div>
            </div>

            <div id="collapseOne" className="collapse">
                <div className="row pt-1">
                    <div className="col-md-6 col-lg-4 mb-3">
                        <div className="showPriceBox">
                            <div className="d-flex">
                                <figure><img src="/images/landingpage/premium-icon.jpg" alt=""/></figure>
                                <div>
                                    <h3>Premium Family Membership - All Included</h3>
                                    <span><del>$120.00</del><b>$99.00</b></span>
                                </div>
                            </div>
                            <hr/>
                            <p>Premium gives access to all our in-studio classes, online classes, events, discounts,
                                and much more. <a href="#premiumModal" data-bs-toggle="modal"
                                    className="btnUnderline fw-normal"> Read More</a></p>
                            <a href="#" className="btn btn-primary text-nowrap mt-2">Enroll</a>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 mb-3">
                        <div className="showPriceBox">
                            <div className="d-flex">
                                <figure><img src="/images/landingpage/e-studio-icon.jpg" alt=""/></figure>
                                <div>
                                    <h3>E-Studio Membership - Online Yoga</h3>
                                    <span><del>$120.00</del><b>$99.00</b></span>
                                </div>
                            </div>
                            <hr/>
                            <p>Premium gives access to all our in-studio classes, online classes, events, discounts,
                                and much more. <a href="" className="btnUnderline fw-normal"> Read More</a></p>
                            <a href="#" className="btn btn-primary text-nowrap mt-2">Enroll</a>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4 mb-3">
                        <div className="showPriceBox">
                            <div className="d-flex">
                                <figure className="mb-0"><img src="/images/landingpage/basic-icon.jpg" alt=""/></figure>
                                <div>
                                    <h3>Basic Membership - Community & Events</h3>
                                    <span><del>$120.00</del><b>$99.00</b></span>
                                </div>
                            </div>
                            <hr/>
                            <p>Premium gives access to all our in-studio classes, online classes, events, discounts,
                                and much more. <a href="" className="btnUnderline fw-normal"> Read More</a></p>
                            <a href="#" className="btn btn-primary text-nowrap mt-2">Enroll</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row px-md-1">
                <div className="col-md-6 mb-3 px-md-2">
                    <div className="classContent">
                        <div className="classTime">
                            <strong className="fw-semibold">Every Sunday</strong>
                            <strong className="fw-semibold">9:00 AM - 10:00 AM</strong>
                        </div>
                        <div className="d-md-flex  align-items-center gap-3">
                            <div className="classDetail">
                                <figure className="mb-0"><img src="/images/landingpage/gentle-yoga.jpg" alt=""/></figure>
                                <p className="mb-0"><b className="fw-bold">Gentle Yoga</b> (This class is designed
                                    especially for seniors or those with pre- existing health conditions.
                                    The instructor will know each student and his abilities and will demonstrate
                                    asanas with greater detail and safer techniques. Led by Dr Naresh Chand.
                                    60 min.)</p>
                            </div>
                            <a href="#gentleYogaModal" data-bs-toggle="modal" className="btn btn-primary text-nowrap">Sign
                                up</a>
                        </div>
                        <ul className="classInfo">
                            <li>
                                <span>Instructor<b>Dr Naresh C.</b></span>
                            </li>
                            <li>
                                <span>Class<b>Gentle Yoga</b></span>
                            </li>
                            <li>
                                <span>Duration<b>1hr</b></span>
                            </li>
                            <li>
                                <span>Price<b>$20.00</b></span>
                            </li>
                        </ul>


                    </div>
                </div>
                <div className="col-md-6 mb-3 px-md-2">
                    <div className="classContent">
                        <div className="classTime">
                            <strong className="fw-semibold">Every Sunday</strong>
                            <strong className="fw-semibold">9:00 AM - 10:00 AM</strong>
                        </div>
                        <div className="d-md-flex  align-items-center gap-3">
                            <div className="classDetail">
                                <figure className="mb-0"><img src="/images/landingpage/gentle-yoga.jpg" alt=""/></figure>
                                <p className="mb-0"><b className="fw-bold">Gentle Yoga</b> (This class is designed
                                    especially for seniors or those with pre- existing health conditions.
                                    The instructor will know each student abilities and will demonstrate
                                    asanas with greater detail and safer techniques. Led by Dr Naresh Chand.
                                    60 min.)</p>
                            </div>
                            <a href="#gentleYogaModal" data-bs-toggle="modal" className="btn btn-primary text-nowrap">Sign
                                up</a>
                        </div>
                        <ul className="classInfo">
                            <li>
                                <span>Instructor<b>Dr Naresh C.</b></span>
                            </li>
                            <li>
                                <span>Class<b>Gentle Yoga</b></span>
                            </li>
                            <li>
                                <span>Duration<b>1hr</b></span>
                            </li>
                            <li>
                                <span>Price<b>$20.00</b></span>
                            </li>
                        </ul>


                    </div>
                </div>
                <div className="col-md-6 mb-3 px-md-2">
                    <div className="classContent">
                        <div className="classTime">
                            <strong className="fw-semibold">Every Sunday</strong>
                            <strong className="fw-semibold">9:00 AM - 10:00 AM</strong>
                        </div>
                        <div className="d-md-flex  align-items-center gap-3">
                            <div className="classDetail">
                                <figure className="mb-0"><img src="/images/landingpage/gentle-yoga.jpg" alt=""/></figure>
                                <p className="mb-0"><b className="fw-bold">Gentle Yoga</b> (This class is designed
                                    especially for seniors or those with pre- existing health conditions.
                                    The instructor will know each student abilities and will demonstrate
                                    asanas with greater detail and safer techniques. Led by Dr Naresh Chand.
                                    60 min.)</p>
                            </div>
                            <a href="" className="btn btn-primary text-nowrap">Sign up</a>
                        </div>
                        <ul className="classInfo">
                            <li>
                                <span>Instructor<b>Dr Naresh C.</b></span>
                            </li>
                            <li>
                                <span>Class<b>Gentle Yoga</b></span>
                            </li>
                            <li>
                                <span>Duration<b>1hr</b></span>
                            </li>
                            <li>
                                <span>Price<b>$20.00</b></span>
                            </li>
                        </ul>


                    </div>
                </div>
                <div className="col-md-6 mb-3 px-md-2">
                    <div className="classContent">
                        <div className="classTime">
                            <strong className="fw-semibold">Every Sunday</strong>
                            <strong className="fw-semibold">9:00 AM - 10:00 AM</strong>
                        </div>
                        <div className="d-md-flex  align-items-center gap-3">
                            <div className="classDetail">
                                <figure className="mb-0"><img src="/images/landingpage/gentle-yoga.jpg" alt=""/></figure>
                                <p className="mb-0"><b className="fw-bold">Gentle Yoga</b> (This class is designed
                                    especially for seniors or those with pre- existing health conditions.
                                    The instructor will know each student abilities and will demonstrate
                                    asanas with greater detail and safer techniques. Led by Dr Naresh Chand.
                                    60 min.)</p>
                            </div>
                            <a href="" className="btn btn-primary text-nowrap">Sign up</a>
                        </div>
                        <ul className="classInfo">
                            <li>
                                <span>Instructor<b>Dr Naresh C.</b></span>
                            </li>
                            <li>
                                <span>Class<b>Gentle Yoga</b></span>
                            </li>
                            <li>
                                <span>Duration<b>1hr</b></span>
                            </li>
                            <li>
                                <span>Price<b>$20.00</b></span>
                            </li>
                        </ul>


                    </div>
                </div>
                <div className="col-md-6 mb-3 px-md-2">
                    <div className="classContent">
                        <div className="classTime">
                            <strong className="fw-semibold">Every Sunday</strong>
                            <strong className="fw-semibold">9:00 AM - 10:00 AM</strong>
                        </div>
                        <div className="d-md-flex  align-items-center gap-3">
                            <div className="classDetail">
                                <figure className="mb-0"><img src="/images/landingpage/gentle-yoga.jpg" alt=""/></figure>
                                <p className="mb-0"><b className="fw-bold">Gentle Yoga</b> (This class is designed
                                    especially for seniors or those with pre- existing health conditions.
                                    The instructor will know each student abilities and will demonstrate
                                    asanas with greater detail and safer techniques. Led by Dr Naresh Chand.
                                    60 min.)</p>
                            </div>
                            <a href="" className="btn btn-primary text-nowrap">Sign up</a>
                        </div>
                        <ul className="classInfo">
                            <li>
                                <span>Instructor<b>Dr Naresh C.</b></span>
                            </li>
                            <li>
                                <span>Class<b>Gentle Yoga</b></span>
                            </li>
                            <li>
                                <span>Duration<b>1hr</b></span>
                            </li>
                            <li>
                                <span>Price<b>$20.00</b></span>
                            </li>
                        </ul>


                    </div>
                </div>
                <div className="col-md-6 mb-3 px-md-2">
                    <div className="classContent">
                        <div className="classTime">
                            <strong className="fw-semibold">Every Sunday</strong>
                            <strong className="fw-semibold">9:00 AM - 10:00 AM</strong>
                        </div>
                        <div className="d-md-flex align-items-center gap-3">
                            <div className="classDetail">
                                <figure className="mb-0"><img src="/images/landingpage/gentle-yoga.jpg" alt=""/></figure>
                                <p className="mb-0"><b className="fw-bold">Gentle Yoga</b> (This class is designed
                                    especially for seniors or those with pre- existing health conditions.
                                    The instructor will know each student s abilities and will demonstrate
                                    asanas with greater detail and safer techniques. Led by Dr Naresh Chand.
                                    60 min.)</p>
                            </div>
                            <a href="" className="btn btn-primary text-nowrap">Sign up</a>
                        </div>
                        <ul className="classInfo">
                            <li>
                                <span>Instructor<b>Dr Naresh C.</b></span>
                            </li>
                            <li>
                                <span>Class<b>Gentle Yoga</b></span>
                            </li>
                            <li>
                                <span>Duration<b>1hr</b></span>
                            </li>
                            <li>
                                <span>Price<b>$20.00</b></span>
                            </li>
                        </ul>


                    </div>

                </div>
            </div>
        </div>
    </div>

      <FooterSection />
{/* ------------------------------------------- Premium Model---------------------------  */}

 <div className="modal fade cancelModal" id="premiumModal">
        <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 rounded-1">
                <div className="modal-header border-0">
                    <h1 className="modal-title fs-6">Premium & Family Membership</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <div className="premiumPerson">
                        <span>Premium</span>
                        <h5>$49 <span> /Every month</span> <b>Per person</b> </h5>
                    </div>
                    <h6 className="fw-semibold fs-8">Details</h6>
                    <ul className="PlanlistUl pt-2">
                        <li>
                            <img src="/images/landingpage/Icon-check.svg" alt="" width="14"/>All benefits in Basic and E-Studio
                            included
                        </li>
                        <li>
                            <img src="/images/landingpage/Icon-check.svg" alt="" width="14"/>Benefits apply to your whole family
                        </li>
                        <li>
                            <img src="/images/landingpage/Icon-check.svg" alt="" width="14"/>Entry to Amita Jain virtual Open
                            Office for Q&A
                        </li>
                        <li>
                            <img src="/images/landingpage/Icon-check.svg" alt="" width="14"/>Entry to all yoga classes at our
                            Studio for you and family
                        </li>
                        <li>
                            <img src="/images/landingpage/Icon-check.svg" alt="" width="14"/>Free 30 minute targeted massage
                            therapy
                        </li>
                        <li>
                            <img src="/images/landingpage/Icon-check.svg" alt="" width="14"/>10% off all our Ayurvedic herbals,
                            teas, and products
                        </li>
                        <li>
                            <img src="/images/landingpage/Icon-check.svg" alt="" width="14"/>10% off all our Ayurvedic panchakarma
                            therapies
                        </li>
                        <li>
                            <img src="/images/landingpage/Icon-check.svg" alt="" width="14"/>10% off all other therapies
                        </li>
                        <li>
                            <img src="/images/landingpage/Icon-check.svg" alt="" width="14"/>20% off all seasonal detox programs
                        </li>
                        <li>
                            <img src="/images/landingpage/Icon-check.svg" alt="" width="14"/>Access to the Premium Video Library of
                            exclusive videos
                        </li>
                    </ul>
                </div>
                <div className="modal-footer justify-content-start border-0 pt-2 pb-4">
                    <button type="button" className="btn btn-primary">Enroll</button>
                </div>

            </div>
        </div>
    </div>
      {/* -----------------------------------------Gentle Yoga Model ----------------------------------- */}

        <div className="modal fade gentleYogaModal" id="gentleYogaModal">
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0">
                <div className="modal-header border-0">
                    <h1 className="modal-title fs-6">Gentle Yoga</h1>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div className="modal-body">
                    <p>This class is designed especially for seniors or those with pre-existing health conditions.
                        The
                        instructor will know each student abilities and will demonstrate asanas with greater
                        detail
                        and safer techniques. Led by Dr Naresh Chand. 60 min.</p>
                    <form className="signupEveryForm">
                        <div className="row">
                            <div className="col-sm-6 mb-4">
                                <label for="">Number of Attendees:</label>
                                <div className="cartaddMain">
                                    <button className="btn cartBtn">-</button>
                                    <input type="text" value="1"/>
                                    <button className="btn cartBtn">+</button>
                                </div>
                            </div>
                            <div className="col-sm-6 mb-4">
                                <label for="">Number of Sessions:</label>
                                <div className="cartaddMain">
                                    <button className="btn cartBtn">-</button>
                                    <input type="text" value="1"/>
                                    <button className="btn cartBtn">+</button>
                                </div>
                            </div>
                        </div>
                        <div className="mb-3 signupEvery">
                            <label for="Sign up every">Sign up every</label>
                            <div className="d-flex flex-wrap align-items-center gap-2">
                                <select className="form-select w-auto">
                                    <option value="">1</option>
                                    <option value="">2</option>
                                    <option value="">3</option>
                                </select>
                                <select className="form-select selectWeek">
                                    <option value="">Week</option>
                                </select>
                                <span className="mx-3 fs-9 fw-medium">ON</span>
                                <ul className="d-flex gap-3 weekSelectList">
                                    <li>
                                        <div className="cstmCheckbox">
                                            <input type="checkbox" id="sunCheck"/>
                                            <label for="sunCheck">Sun</label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="cstmCheckbox">
                                            <input type="checkbox" id="monCheck"/>
                                            <label for="monCheck">Mon</label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="cstmCheckbox">
                                            <input type="checkbox" id="tueCheck"/>
                                            <label for="tueCheck">Tue</label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="cstmCheckbox">
                                            <input type="checkbox" id="wedCheck"/>
                                            <label for="wedCheck">Wed</label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="cstmCheckbox">
                                            <input type="checkbox" id="thuCheck"/>
                                            <label for="thuCheck">Thu</label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="cstmCheckbox">
                                            <input type="checkbox" id="friCheck"/>
                                            <label for="friCheck">Fri</label>
                                        </div>
                                    </li>
                                    <li>
                                        <div className="cstmCheckbox">
                                            <input type="checkbox" id="satCheck"/>
                                            <label for="satCheck">Sat</label>
                                        </div>
                                    </li>
                                </ul>

                            </div>
                        </div>
                        <div className="startDate">
                            <label for="">Start Date:</label>
                            <input type="text" className="form-control dateInput" placeholder="May 18, 2025"/>
                        </div>

                        <div className="modal-footer justify-content-center border-0 pt-4">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" data-bs-toggle="modal" data-bs-target="#gentleYogaModal2"
                                className="btn btn-primary">Next</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    </div>

    {/* ---------------------------------------------------Gentle Yoga Model 2 ---------------------------------------- */}
    <div class="modal fade gentleYogaModal" id="gentleYogaModal2">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content border-0">
                <div className="modal-header border-0">
                    <h1 class="modal-title fs-6">Gentle Yoga</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p class="mb-2">This class is designed especially for seniors or those with pre-existing health
                        conditions. The instructor will know each student abilities and will demonstrate asanas
                        with
                        greater detail and safer techniques. Led by Dr Naresh Chand. 60 min.</p>
                    <strong class="d-block mb-3 fs-8 fw-semibold">$20.00</strong>

                    <div class="selectCustome active mb-5 position-relative">
                        <div class="select-btn">
                            <span class="sBtn-text"> <strong></strong>Select your option</span>
                            <i class="bi bi-chevron-down fs-7"></i>
                        </div>
                        <ul class="optionul">
                            <li class="option">
                                <div class="option-text ">
                                    <div class="innerDesign d-flex align-items-center gap-2">
                                        <strong>JS</strong>
                                        <span class=""> Smith Jhons <b class="fw-normal">(Me)</b></span>
                                    </div>
                                </div>
                            </li>
                            <li class="option">
                                <div class="option-text ">
                                    <div class="innerDesign d-flex align-items-center gap-2">
                                        <strong>JS</strong>
                                        <span class=""> Smith Jhons <b class="fw-normal">(Me)</b></span>
                                    </div>
                                </div>
                            </li>
                            <li class="option">
                                <div class="option-text ">
                                    <div class="innerDesign d-flex align-items-center gap-2">
                                        <strong>JS</strong>
                                        <span class=""> Smith Jhons <b class="fw-normal">(Me)</b></span>
                                    </div>
                                </div>
                            </li>
                        </ul>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="d-block fs-6 fw-semibold text-success "> <strong class="d-block mb-0 fs-8 fw-semibold text-black">Total </strong>$20.00 </span>
                        <a href="" class="btnUnderline fw-medium"><i> Save with Membership</i></a>
                    </div>
                    <div class="modal-footer justify-ca ontent-center border-0 pt-4">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Back</button>
                        <button type="button" class="btn btn-success">CheckOut</button>
                    </div>
                </div>

            </div>
        </div>
    </div>
    </>
  );
};
export default Classes;
