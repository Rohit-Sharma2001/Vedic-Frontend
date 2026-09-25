'use client';

import React, { useEffect, useState, useRef } from 'react';
import { checkIsOwner } from 'services/config';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';
import Link from 'node_modules/next/link';
import { usePathname } from 'next/navigation';

const InnerBanner = () => {
  const id = "6836d76c18178ff0e3f90540"; // Replace with actual banner ID

  const [isOwner, setIsOwner] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [editing, setEditing] = useState(false);
  const [inputTitle, setInputTitle] = useState('');
  const fileInputRef = useRef(null);
 const pathname = usePathname();
 useEffect(() => {
    fetchBannerData()
   const isIframe = typeof window !== "undefined" && window.self !== window.top;
   const isAdminPath = pathname?.includes('/admin');
   const isAdminUser = checkIsOwner();
 
   if (isAdminUser && (isIframe || isAdminPath)) {
     setIsOwner(true);
   }
 }, [pathname]);

  const fetchBannerData = async () => {
    try {
      const res = await postApi(config.ViewAmitaJainPageDetails, {});
      console.log(res )
      if (res?.statusCode === 200) {
        const data = res.data;
        setBannerTitle(data.banner_title || 'Banner Title');
        setInputTitle(data.banner_title || '');
        const imageUrl = `${process.env.NEXT_PUBLIC_API_URL}/${data.file}`.replace(/\\/g, '/');
        setImagePreview(imageUrl);
      }
    } catch (err) {
      console.error('Error fetching banner info', err);
    }
  };

  const handleBannerTextUpdate = async () => {
    try {
      const payload = { banner_title: inputTitle };
      const res = await updateApiWithFile(config.UpdateAmitaJainPageDetails, id, payload, {});
      if (res?.statusCode === 200) {
        setBannerTitle(inputTitle);
        setEditing(false);
      }
    } catch (err) {
      console.error('Error updating banner title', err);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      updateBannerImage(file);
    }
  };

  const updateBannerImage = async (file) => {
    try {
      const files = { file };
      const payload = {};
      const res = await updateApiWithFile(config.UpdateAmitaJainPageDetails, id, payload, files);
      if (res?.statusCode === 200) {
        // const updatedUrl = `${process.env.NEXT_PUBLIC_API_URL}/${res.data.file}`;
        setImagePreview(res.data.file.replace(/\\/g, '/'));
      }
    } catch (err) {
      console.error('Error updating banner image', err);
    }
  };

  return (
    <div
      className="innerBanner"
      style={{
        backgroundImage: `url(${imagePreview})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="container-fluid">
        <div className="innerBannertxt">
          {editing ? (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input
                type="text"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                style={{ padding: '6px', width: '300px' }}
              />
              <button onClick={handleBannerTextUpdate}>Save</button>
              <button onClick={() => setEditing(false)}>Cancel</button>
            </div>
          ) : (
            <>
              <h1>{bannerTitle}</h1>
              {isOwner && (
                <button
                  className="btn btn-primary mt-2 me-2"
                  onClick={() => setEditing(true)}
                >
                  ✏️ Edit Title
                </button>
              )}
            </>
          )}

          {isOwner && (
            <>
              <button
                className="btn btn-primary mt-2"
                onClick={() => fileInputRef.current?.click()}
                style={{marginRight:'5px'}}
              >
                ✏️ Edit Image
              </button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </>
          )}

          {/* <a href="" className="btn btn-primary mt-2">View Schedule</a> */}
           <Link href={'/LandingPage/components/Schedule'} className="btn btn-primary mt-2">View Schedule</Link>
        </div>
      </div>
    </div>
  );
};

export default InnerBanner;