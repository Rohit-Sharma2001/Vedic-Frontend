'use client'
import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import HeaderWithDropdown from 'app/(landingpage)/LandingPage/components/HeaderWithDropdown/page';
import FooterSection from 'app/(landingpage)/LandingPage/components/Footer/page';
import Link from 'node_modules/next/link';
import 'app/(landingpage)/LandingPage/public/css/style.css'
import "flatpickr/dist/flatpickr.min.css";


export default function EmployeeChat() {
 const router = useRouter();

  return (
    <>
      {/* <HeaderWithDropdown /> */}
       <div className="">
      <div className="mainHeaderchat d-flex flex-wrap justify-content-between align-items-center">
            <div className="logoLeft">
                <img src="/images/landingpage/vedic-health.png" alt="" width="160"/>
            </div>
             {/* <div className="userSearch">
                <input type="text" className="form-control" placeholder="Search People"/>
            </div>  */}
            <div className="profileMain">
                <a href="javascript:void(0)" className="profile-image">
                    <img src="/images/landingpage/profile-image.png" alt=""/>
                </a>

            </div>

        </div>
     <div className="">
            <div className="chatMain d-md-flex flex-wrap">
                <div className="userleft">
                    <div className="chatGroup">
                        <div className="titleDiv">
                            <h6>Activity</h6>
                        </div>
                        <ul className="chatList">
                            <li>
                                <a href="javascript:void(0)"
                                    className="chatToggle d-flex justify-content-between unread active">
                                    <div className="d-flex ">
                                        <div className="chat-profile position-relative">
                                            <img src="/images/landingpage/ben.png" alt="imagegirl"/>
                                        </div>
                                        <div className="conntxt">
                                            <strong>Anubhav kumawat mentioned you</strong>
                                            <p>Rishabh hii</p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <strong className="msgTimes">2:04 PM</strong>
                                        <span className="msgCount">1</span>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)" className="d-flex justify-content-between">
                                    <div className="d-flex ">
                                        <div className="chat-profile">
                                            <img src="/images/landingpage/ben.png" alt="imagegirl"/>
                                        </div>
                                        <div className="conntxt">
                                            <strong>Amber</strong>
                                            <p>Hi Raghav</p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <strong className="msgTimes">2:04 PM</strong>
                                        <span className="msgCount">1</span>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)" className="d-flex justify-content-between">
                                    <div className="d-flex ">
                                        <div className="chat-profile">
                                            <img src="/images/landingpage/ben.png" alt="imagegirl"/>
                                        </div>
                                        <div className="conntxt">
                                            <strong>Amber</strong>
                                            <p>Hi Raghav</p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <strong className="msgTimes">2:04 PM</strong>
                                        <span className="msgCount">1</span>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)" className="d-flex justify-content-between">
                                    <div className="d-flex ">
                                        <div className="chat-profile">
                                            <img src="/images/landingpage/ben.png" alt="imagegirl"/>
                                        </div>
                                        <div className="conntxt">
                                            <strong>Amber</strong>
                                            <p>Hi Raghav</p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <strong className="msgTimes">2:04 PM</strong>
                                        <span className="msgCount">1</span>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)" className="d-flex justify-content-between">
                                    <div className="d-flex ">
                                        <div className="chat-profile">
                                            <img src="/images/landingpage/ben.png" alt="imagegirl"/>
                                        </div>
                                        <div className="conntxt">
                                            <strong>Amber</strong>
                                            <p>Hi Raghav</p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <strong className="msgTimes">2:04 PM</strong>
                                        <span className="msgCount">1</span>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)" className="d-flex justify-content-between">
                                    <div className="d-flex ">
                                        <div className="chat-profile">
                                            <img src="/images/landingpage/curz.png" alt="imagegirl"/>
                                        </div>
                                        <div className="conntxt">
                                            <strong>Amber</strong>
                                            <p>Hi Raghav</p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <strong className="msgTimes">2:04 PM</strong>
                                        <span className="msgCount">1</span>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)" className="d-flex justify-content-between">
                                    <div className="d-flex ">
                                        <div className="chat-profile">
                                            <img src="/images/landingpage/ben.png" alt="imagegirl"/>
                                        </div>
                                        <div className="conntxt">
                                            <strong>Amber</strong>
                                            <p>Hi Raghav</p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <strong className="msgTimes">2:04 PM</strong>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)" className="d-flex justify-content-between">
                                    <div className="d-flex ">
                                        <div className="chat-profile">
                                            <img src="/images/landingpage/curz.png" alt="imagegirl"/>
                                        </div>
                                        <div className="conntxt">
                                            <strong>Amber</strong>
                                            <p>Hi Raghav</p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <strong className="msgTimes">2:04 PM</strong>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)" className="d-flex justify-content-between">
                                    <div className="d-flex ">
                                        <div className="chat-profile">
                                            <img src="/images/landingpage/ben.png" alt="imagegirl"/>
                                        </div>
                                        <div className="conntxt">
                                            <strong>Amber</strong>
                                            <p>Hi Raghav</p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <strong className="msgTimes">2:04 PM</strong>
                                    </div>
                                </a>
                            </li>
                            <li>
                                <a href="javascript:void(0)" className="d-flex justify-content-between">
                                    <div className="d-flex ">
                                        <div className="chat-profile">
                                            <img src="/images/landingpage/curz.png" alt="imagegirl"/>
                                        </div>
                                        <div className="conntxt">
                                            <strong>Amber</strong>
                                            <p>Hi Raghav</p>
                                        </div>
                                    </div>
                                    <div className="text-end">
                                        <strong className="msgTimes">2:04 PM</strong>
                                    </div>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="chatSection ">
                    <div className="chatRight">
                        <div className="chatModal">
                            <div className="chatbody">
                                <div className="chats">
                                    <div className="msgContent message-in">
                                        <div className="userimg">
                                            <img src="/images/landingpage/curz.png" alt=""/>
                                        </div>
                                        <div className="msgtextGroup">
                                            <div className="msgTime"><span>Amber</span> 10:00 AM</div>
                                            <div className="msgText">
                                                <span> Hello</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="msgContent message-out">
                                        <div className="msgtextGroup">
                                            <div className="msgTime">10:01 AM</div>
                                            <div className="msgText">
                                                <span> Hello</span>
                                            </div>
                                        </div>
                                        <div className="userimg">
                                            <img src="/images/landingpage/userIcon.png" alt=""/>
                                        </div>
                                    </div>
                                    <div className="msgContent message-in">
                                        <div className="userimg">
                                            <img src="/images/landingpage/curz.png" alt=""/>
                                        </div>
                                        <div className="msgtextGroup">
                                            <div className="msgTime"><span>Amber</span> 10:03 AM</div>
                                            <div className="msgText">
                                                <span> How do I disable click outside modal in Bootstrap
                                                    4?</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="msgContent message-out">
                                        <div className="msgtextGroup">
                                            <div className="msgTime">10:05 AM</div>
                                            <div className="msgText">
                                                <span>Simply, when you are using the modal and want to
                                                    disable the “click outside modal area to
                                                    close</span>
                                            </div>
                                        </div>
                                        <div className="userimg">
                                            <img src="/images/landingpage/userIcon.png" alt=""/>
                                        </div>
                                    </div>
                                    <div className="msgContent message-in">
                                        <div className="userimg">
                                            <img src="/images/landingpage/curz.png" alt=""/>
                                        </div>
                                        <div className="msgtextGroup">
                                            <div className="msgTime"><span>Amber</span> 10:00 AM</div>
                                            <div className="msgText">
                                                <span> Hello</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="msgtimer">
                                        Yesterday 10:01 AM
                                    </div>
                                    <div className="msgContent message-out">
                                        <div className="msgtextGroup">
                                            <div className="msgTime"> 10:01 AM</div>
                                            <div className="msgText">
                                                <span> Hello</span>
                                            </div>
                                        </div>
                                        <div className="userimg">
                                            <img src="/images/landingpage/userIcon.png" alt=""/>
                                        </div>
                                    </div>
                                    <div className="msgContent message-in">
                                        <div className="userimg">
                                            <img src="/images/landingpage/curz.png" alt=""/>
                                        </div>
                                        <div className="msgtextGroup">
                                            <div className="msgTime"><span>Amber</span> 10:03 AM</div>
                                            <div className="msgText">
                                                <span> How do I disable click outside modal in Bootstrap
                                                    4?</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="msgtimer">
                                        Today 10:05 AM
                                    </div>
                                    <div className="msgContent message-out">
                                        <div className="msgtextGroup">
                                            <div className="msgTime">10:05 AM</div>
                                            <div className="msgText">
                                                <span>Simply, when you are using the modal and want to
                                                    disable the “click outside modal area to
                                                    close
                                                    it” functionality, you just need to set the backdrop
                                                    value (data-bs-backdrop attribute) of the
                                                    modal
                                                    element to “static” and you can disable that
                                                    functionality.</span>
                                            </div>
                                        </div>
                                        <div className="userimg">
                                            <img src="/images/landingpage/userIcon.png" alt=""/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="chatFoot">
                        <div className="msgInputgroup">
                            <div className="msgInput position-relative">
                                <button type="button" className="emojitoggle"><img src="/images/landingpage/emoji-icon.svg" alt=""
                                        width="23"/></button>
                                <input className="form-control" id="msg-input" type="text" placeholder="Type a message"/>
                            </div>
                            <button type="button" className="mstBtn addfileToggle"><img src="/images/landingpage/add-file.svg" alt=""
                                    width="20"/></button>
                            <button type="button" className="mstBtn sendBtn"><img src="/images/landingpage/send-msg.svg" alt=""
                                    width="25"/></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </div>
    
     {/* <FooterSection/> */}
    </>
  );
}
