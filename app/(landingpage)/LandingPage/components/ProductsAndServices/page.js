'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';
import { useRouter } from 'next/navigation';
const ProductAndServices = () => {
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [labsimagePreview, setLabsImagePreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [ayurvedicproducts, setAyurvedicProducts] = useState({
      bannerImage: null,
      title: '',
      type:"ayervedic_products",
      descriptions: '',
      button_label: '',
      button_route: '',
  });
  const [labsdetails, setLabsDetails] = useState({
    bannerImage: null,
    title: '',
    type:"labs",
    descriptions: '',
    button_label: '',
    button_route: '',
});

  useEffect(() => {
    fetchInitialProductsData();
    fetchInitialLabsData()
}, []);
const handleNavigation = (route) => {
  if (route) {
    router.push(route);
  }
};

const fetchInitialProductsData = async () => {
    const data ={id:"676d2d96d81f0fb149036358"}
    try {
        const endpoint = config.ViewLandingPageCaraousalDatabyid;
        const response = await postApi(endpoint,data );
        console.log(response);
        if (response.statusCode === 201) {
            console.log(response)
            setAyurvedicProducts({
                bannerImage: null,
                title: response.result?.title || '',
                descriptions: response.result?.descriptions || '',
                button_label: response.result?.button_label || '',
                button_route: response.result?.button_route || '',
            });
            setImagePreview(response.result?.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.result.file}` : null);
        }
    } catch (error) {
        console.error('Error fetching initial data:', error);
    }
};
const fetchInitialLabsData = async () => {
  const data ={id:"676d2e1ed81f0fb14903635c"}
  try {
      const endpoint = config.ViewLandingPageCaraousalDatabyid;
      const response = await postApi(endpoint,data );
      console.log(response);
      if (response.statusCode === 201) {
          console.log(response)
          setLabsDetails({
              bannerImage: null,
              title: response.result?.title || '',
              descriptions: response.result?.descriptions || '',
              button_label: response.result?.button_label || '',
              button_route: response.result?.button_route || '',
          });
          setLabsImagePreview(response.result?.file ? `${process.env.NEXT_PUBLIC_API_URL}/${response.result.file}` : null);
      }
  } catch (error) {
      console.error('Error fetching initial data:', error);
  }
};
 
      return(<>
    <div className="">
    <div className="container">
      <div className="row">
        <div className="col-md-6 mb-3 pe-md-4">
          <div className="ayurvedicInfo">
            <figure>
             <img src={imagePreview} />
            </figure>
            <div className="eventNow">
              <h3>{ayurvedicproducts.title}</h3>
              <p>{ayurvedicproducts.descriptions}
              </p>
              <a  onClick={() => handleNavigation(ayurvedicproducts?.button_route)} className="btn btn-primary px-md-4">
                {ayurvedicproducts.button_label}
              </a>
            </div>
          </div>
        </div>
        <div className="col-md-6 mb-3 ps-md-4">
          <div className="ayurvedicInfo">
            <figure>
             <img src={labsimagePreview} />
            </figure>
            <div className="eventNow">
              <h3>{labsdetails.title}</h3>
              <p>{labsdetails.descriptions}
              </p>
              <a  onClick={() => handleNavigation(labsdetails?.button_route)} className="btn btn-primary px-md-4">
                {labsdetails.button_label}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  </>)
};

export default ProductAndServices;
