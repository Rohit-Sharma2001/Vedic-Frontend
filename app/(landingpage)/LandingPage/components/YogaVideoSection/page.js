'use client';
import React, { useState, useRef } from 'react';

const YogaVideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef(null);

  const playVideo = () => {
    setIsPlaying(true);
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.style.display = 'block';
        videoRef.current.play();
      }
      querySelector('.videoGroup').style.display = 'none';
    }, 100);
  };

  return (
    <div className="videoSection">
      <div className="container">
        <div className="videoGroup position-relative">
          {!isPlaying ? (
            <>
              <img src="/images/landingpage/video-image.jpg" alt="Yoga Pose" className="image" />
              <button className="playBtn" onClick={playVideo}>
                <img src="/images/landingpage/play-icon.svg" width="20" alt="Play" /> Click here to play
              </button>
            </>
          ) : null}
        </div>

        {isPlaying && (
          <div className="video-container" id="videoContainer">
            <video ref={videoRef} id="videoPlayer" width="100%" controls>
              <source src="/images/landingpage/video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div>
    </div>
  );
};

export default YogaVideoSection;
