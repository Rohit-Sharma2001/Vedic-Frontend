'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { postApi } from 'services/api';
import Loader from 'services/Loader/page';
import { config } from 'services/config';

export default function MyReviews() {

  const [userData, setUserData] = useState()
  const [reviews, setReviews] = useState([])
  const [loading,setLoading]=useState(false)
  const [loader,setLoader]=useState(false)

  const fetchReviews = async (user) => {
    try {
      setLoader(true)
      const endpoint = config.getReviews;
      const data = { user_id: user._id };
      const response = await postApi(endpoint, data);

      console.log(response)
      if (response.statusCode === 201 || response.statusCode === 200) {
        setReviews(response.data)

        setLoading(false)
      } else {
        setReviews([])
      }
    } catch (error) {
      setLoading(false)
      console.error("Error fetching product:", error);
    }
  };
  useEffect(()=>{
    let user = JSON.parse(localStorage.getItem("user") || JSON.stringify({}))
    setUserData(user)
    fetchReviews(user)
  },[])
  const reviews1 = [
    {
      title: 'Amalaki Powder',
      brand: 'Rasa Herbs',
      date: '18 July 2022',
      rating: '3.5',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry...',
      img: '/images/landingpage/amalaki-powder-img.jpg',
      gallery: [],
    },
    {
      title: 'Brahmi (Gotu Kola) Powder',
      brand: 'Rasa Herbs',
      date: '18 July 2022',
      rating: '3.5',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry...',
      img: '/images/landingpage/powder-img.jpg',
      gallery: [
        '/images/landingpage/product-image5.jpg',
        '/images/landingpage/product-image6.jpg',
        '/images/landingpage/product-image5.jpg',
        '/images/landingpage/product-image6.jpg',
      ],
    },
    {
      title: 'Haritaki Powder',
      brand: 'Rasa Herbs',
      date: '18 July 2022',
      rating: '3.5',
      text: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry...',
      img: '/images/landingpage/powder-mix-img.jpg',
      gallery: [],
    },
  ];

  return (
    <div className=" reviewMy">
      {/* <h2 className="fs-6 fw-semibold mb-4">My Reviews</h2> */}
      {reviews && reviews.length > 0 ?  reviews.map((r, idx) => (
        <div className="userReview" key={idx}>
          <div className="d-md-flex justify-content-between align-items-center">
            <div className="reviewProfile">
              <figure className="mb-0">
                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${r?.productDetails?.coverImage}`} alt="product" width={80} height={80} />
              </figure>
              <div className="reviewUserName">
              <Link href={"/Shop/product/"+r.productDetails?._id} style={{color:"#000"}}> <strong>{r.productDetails?.productName} <b>{r.productDetails?.brand_name}</b></strong></Link>
                
                <span>Reviewed on {r.date}</span>
              </div>
            </div>
            <div className="d-flex flex-column gap-1">
  <div className="d-flex align-self-end">
    {[1, 2, 3, 4, 5].map((star) => (
      <span
        key={star}
        className={`star ${star <= r?.rating ? 'filled' : ''}`}
        style={{
          display: 'inline-block',
          fontSize: 30,
          color: star <= r?.rating ? '#71318B' : '',
        }}
      >
        ★
      </span>
    ))}
  </div>
  {/* <b className="fw-semibold fs-9 align-self-end">{r.rating}</b> */}
  {/* <div className="">{r?.rating}</div> */}
</div>

          </div>
          <p>{r.review}</p>

          {r.additionalImages && r.additionalImages.length > 0 && (
  <ul className="reviewImages">
    {r.additionalImages.map((img, index) => (
      <li key={index}>
        <img
          // src={img}
          src={`${process.env.NEXT_PUBLIC_API_URL}/${img}`}
          width={100}
          height={100}
          alt={`review-img-${index}`}
        />
      </li>
    ))}
  </ul>
)}

          <hr className="my-4" />
        </div>
      ))
    :
    <div className='text-center'>
     <h4>No Reviews</h4>  
    </div>
    }
    </div>
  );
}
