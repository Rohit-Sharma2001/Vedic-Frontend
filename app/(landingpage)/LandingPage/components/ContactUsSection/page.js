'use client';

import React, { useState, useEffect } from 'react';
import { postApi } from 'services/api';
import { config } from 'services/config';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const libraries = ["places"];

const ContactSection = () => {
  const [centers, setCenters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchCenters(currentPage);
  }, [currentPage]);

  const fetchCenters = async (page) => {
    try {
      const endpoint = config.centers;
      const data = { page, pageSize };
      const response = await postApi(endpoint, data);
      console.log("All centers:", response.centers);
      setCenters(response.centers || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (error) {
      console.error('Error fetching centers:', error);
    }
  };

  return (
    <section className="contactSection">
      <div className="container">
        <div className="section-heading pb-0">
          <img src="/images/landingpage/watermark.png" width="50" className="d-block mx-auto" alt="Watermark" />
          <h2 className="mb-2">Vedic Health Ayurved</h2>
          <p>Natural Healing Center</p>
        </div>

        {/* Load Google Maps API */}
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={libraries}>
          {centers.map((location, index) => (
            <div className="addressBox" key={index}>
              <div className="row">
                
                {/* Map Section */}
                <div className="col-md-6 pe-md-4 mb-4 mb-md-0">
                  {location.latitude && location.longitude ? (
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "350px" }}
                      center={{
                        lat: parseFloat(location.latitude),
                        lng: parseFloat(location.longitude),
                      }}
                      zoom={14}
                    >
                      <Marker
                        position={{
                          lat: parseFloat(location.latitude),
                          lng: parseFloat(location.longitude),
                        }}
                        title={location.centerName}
                      />
                    </GoogleMap>
                  ) : (
                    <p>Map location not available</p>
                  )}
                </div>

                {/* Location Details */}
                <div className="col-md-6 ps-md-4">
                  <div className="addressDetail">
                    <h3>{location?.centerName}</h3>
                    <p className="d-flex gap-3">
                      <img src="/images/landingpage/address.svg" alt="Address" /> {location?.address}
                    </p>
                    <hr />
                    <p className="d-flex gap-3">
                      <img src="/images/landingpage/call.svg" alt="Phone" /> {location?.phone_number || "N/A"}
                    </p>
                    <hr />
                    <p className="d-flex gap-3">
                      <img src="/images/landingpage/mail.svg" alt="Email" /> {location?.email}
                    </p>
                    <hr />
                    <div dangerouslySetInnerHTML={{ __html: location.details }} />
                  </div>
                </div>

              </div>
            </div>
          ))}
        </LoadScript>
      </div>
    </section>
  );
};

export default ContactSection;
