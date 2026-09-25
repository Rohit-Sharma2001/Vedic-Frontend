// components/ProductDetailsPage.jsx

"use client";
import React, { useRef } from 'react';
import Image from "next/image";
import Link from "next/link";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../../../LandingPage/public/css/style.css';
import HeaderWithDropdown from 'app/(landingpage)/LandingPage/components/HeaderWithDropdown/page';
import FooterSection from 'app/(landingpage)/LandingPage/components/Footer/page';
// import SubHeader from 'app/(landingpage)/LandingPage/components/SubHeader/page';

export default function ProductDetailsPage() {
    const sliderRef = useRef(null);
    const thumbSliderRef = useRef(null);
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2500,
        responsive: [
          { breakpoint: 991, settings: { slidesToShow: 2 } },
          { breakpoint: 767, settings: { slidesToShow: 1, dots: true } },
        ],
      };

      const thumbSliderSettings = {
        slidesToShow: 4,
        slidesToScroll: 4,
        vertical: true,
        arrows: false,
        focusOnSelect: true,
        infinite: false,
        responsive: [
          { breakpoint: 767, settings: { vertical: false, slidesToShow: 3 } },
          { breakpoint: 580, settings: { vertical: false, slidesToShow: 3 } },
          { breakpoint: 380, settings: { vertical: false, slidesToShow: 3 } },
        ],
      };
      const productThumbs = [
        "product-image1.jpg",
        "product-image2.jpg",
        "product-image3.jpg",
        "product-image1.jpg",
        "product-image2.jpg"
      ];
    
      const nextSlide = () => sliderRef.current.slickNext();
      const prevSlide = () => sliderRef.current.slickPrev();

      const similarProducts = [
        "product-image5.jpg",
        "product-image6.jpg",
        "product-image7.jpg",
        "product-image5.jpg"
      ];
  return (
    <>
    <HeaderWithDropdown/>
     {/* <SubHeader topPosition={80} /> */}
      <div className="deatilMain">
        <div className="container-fluid">
          <div className="breadcrumbGroup">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link href="#">Home</Link></li>
              <li className="breadcrumb-item"><Link href="#">Ayurvedic Products</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Amalaki Powder</li>
            </ol>
          </div>

          <div className="row">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="productSlider thumbMobile">
              <div className="pdtthumb">
                  {/* Thumbnail Image Carousel */}
                  <Slider {...thumbSliderSettings} ref={thumbSliderRef} className="slider slider-nav">
                    {productThumbs.map((img, idx) => (
                      <div key={idx} className="thumbnail-image">
                        <div className="thumbImg">
                          <img src={`/images/landingpage/${img}`} alt="slider-img" width={500} height={500} />
                        </div>
                      </div>
                    ))}
                  </Slider>
                </div>
                <div className="pdtMain">
                  <div className="slider slider-for">
                    {["product-image1.jpg"].map((img, idx) => (
                      <div key={idx}>
                        <div className="slider-banner-image">
                          <img src={`/images/landingpage/${img}`} alt="slider-img" width={500} height={500} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="d-xl-flex mt-3 gap-2 px-md-3 btnDiv">
                    <Link href="#" className="btn btn-primary w-50">
                      <img className="me-1" src="/images/landingpage/carticon.svg" width={16} height={16} alt="cart" /> Add Toaa Cart
                    </Link>
                    <Link href="shopping-cart.html" className="btn btn-orange w-50">
                      <img className="me-1" src="/images/landingpage/buyicon.svg" width={16} height={16} alt="buy" /> Buy Now
                    </Link>
                  </div>
                </div>
              </div>

              <div className="d-xl-flex mt-3 gap-2 px-md-3 btnmobile">
                <Link href="#" className="btn btn-primary w-50">
                  <img className="me-1" src="/images/landingpage/carticon.svg" width={16} height={16} alt="cart" /> Add To Cart
                </Link>
                <Link href="shopping-cart.html" className="btn btn-orange w-50">
                  <img className="me-1" src="/images/landingpage/buyicon.svg" width={16} height={16} alt="buy" /> Buy Now
                </Link>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="productContent">
                <div className="d-md-flex justify-content-between">
                  <div className="pdtyName">
                    <h2>Rasa Herbs</h2>
                    <h3>Amalaki Powder</h3>
                    <div className="item_price mt-3"><span>Price</span><strong>$15.00</strong></div>
                    <div className="item_rating_count">
                      <span className="rating_count">4.5 <img src="/images/landingpage/star-icon.svg" width={10} height={10} alt="star" /></span>
                      <span>196 Ratings and 8 reviews</span>
                    </div>
                    <div className="qtyGroup">
                      <strong>Quantity</strong>
                      <div className="quantity">
                        <button className="minus" aria-label="Decrease">&minus;</button>
                        <input type="number" className="input-box" defaultValue={1} min={1} max={10} />
                        <button className="plus" aria-label="Increase">+</button>
                      </div>
                    </div>
                  </div>
                  <div className="shareLink">
                    <ul className="d-flex align-items-center gap-2">
                      <li className="me-2">Share:</li>
                      {["facebook-circle-icon.svg", "twitter-circle-icon.svg", "pinterest-circle-icon.svg", "copy-link.svg"].map((icon, idx) => (
                        <li key={idx}><Link href="#"><img src={`/images/landingpage/${icon}`} width={20} height={20} alt="social" /></Link></li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="itemsDetail">
                  <table className="table">
                    <tbody>
                      <tr><th>Brand</th><td>Swanson</td></tr>
                      <tr><th>Item Weight</th><td>250 Grams</td></tr>
                      <tr><th>Item Form</th><td>Powder</td></tr>
                      <tr><th>Ingredient</th><td>Emblica / Indian Gooseberry</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="aboutItems">
                  <h4>About Item</h4>
                  <p>Amla Powder 100 grams. RASA Herbs are raw, whole, unprocessed, and certified organic...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="productReview">
            <div className="section-heading text-start mw-100 pb-3 d-flex align-items-center justify-content-between">
              <h2>Product Review</h2>
              <Link href="#writeReview" data-bs-toggle="modal" className="btn btn-primary">Write a Review</Link>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3 pe-md-4">
                <div className=" d-flex align-items-center gap-2 reviewCount mb-3">
                  <img src="/images/landingpage/star.png" width={100} height={20} alt="star" />
                  <span>3.5 out of 5</span>
                </div>

                <div className="ratingBar">
                  {[5, 4, 3, 2, 1].map((star, idx) => (
                    <div key={idx} className="d-flex align-items-center gap-2 justify-content-between mb-3">
                      <span>{star} star</span>
                      <div className="progress" role="progressbar">
                        <div className="progress-bar" style={{ width: `${star * 20}%` }}></div>
                      </div>
                      <span className="text-center">{star * 11}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="col-md-8 border-start ps-md-4">
                {[1, 2, 3].map((rev) => (
                  <div key={rev} className="userReview">
                    <div className="reviewProfile">
                      <figure className="mb-0"><img src="/images/landingpage/smith-jhons.png" alt="user" width={50} height={50} /></figure>
                      <div className="reviewUserName">
                        <strong>Smith Jhons</strong>
                        <img src="/images/landingpage/star.png" width={80} height={16} alt="star" />
                        <span>Reviewed on 18 July 2022</span>
                      </div>
                    </div>
                    <p>Lorem Ipsum is simply dummy text... <Link href="#" className="readMore">Read More</Link></p>
                    {rev === 2 && (
                      <ul className="reviewImages">
                        <li><img src="/images/landingpage/product-image5.jpg" width={100} height={100} alt="" /></li>
                        <li><img src="/images/landingpage/product-image6.jpg" width={100} height={100} alt="" /></li>
                      </ul>
                    )}
                    <hr />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="productsInner similarProducts position-relative">
      <div className="section-heading text-start mw-100 pb-3">
        <h2>Similar Products</h2>
      </div>

      

      <Slider {...settings} ref={sliderRef} className="productSlide">
        {similarProducts.map((img, index) => (
          <div key={index}>
            <div className="journeyBox">
              <figure className="mb-1">
                <img src={`/images/landingpage/${img}`} alt="product" width={200} height={200} />
              </figure>
              <div className="contentproduct">
                <span className="text-black fs-7 pb-1">Rasa</span>
                <h3 className="text-orange fs-7 fw-semibold">Amalaki Powder</h3>
                <hr />
                <div className="d-flex justify-content-between align-items-baseline">
                  <b className="text-success">$15.00</b>
                  <Link href="#" className="btn btn-primary">Add To Cart</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>

    
    </div>
        </div>
      </div>

      {/* Review Modal */}
      <div className="modal fade writeReview" id="writeReview">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0">
            <div className="modal-header border-0">
              <h1 className="modal-title fs-6">Write Comment</h1>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form className="commentForm">
                <div className="form-group mb-4">
                  <label>Name</label>
                  <input type="text" className="form-control" />
                </div>
                <div className="form-group mb-4">
                  <label>Enter Review</label>
                  <textarea className="form-control"></textarea>
                  <span className="text-end">1000 Characters</span>
                </div>
                <div className="form-group mb-4">
                  <label>Image Attachment</label>
                  <ul className="uploadImgUl mt-3">
                    <li>
                      <figure className="uploadedImg"><img src="/images/landingpage/product-image1.jpg" alt="" width={100} height={100} />
                        <button type="button" className="deleteIcon"><i className="bi bi-trash"></i></button>
                      </figure>
                    </li>
                    <li>
                      <div className="attachmentGroup">
                        <input type="file" className="d-none" id="attachment1" />
                        <label htmlFor="attachment1"><i className="bi bi-cloud-arrow-up-fill"></i></label>
                      </div>
                    </li>
                    <li>
                      <div className="attachmentGroup">
                        <input type="file" className="d-none" id="attachment2" />
                        <label htmlFor="attachment2"><i className="bi bi-cloud-arrow-up-fill"></i></label>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="form-group mb-4">
                  <label>Rate</label>
                  <img src="/images/landingpage/star.png" width={170} height={30} alt="star" />
                </div>
                <div className="text-center my-2 mt-4">
                  <button type="button" className="btn btn-primary w-75">Submit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <FooterSection/>
    </>
  );
}
