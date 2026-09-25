"use client";

import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postApiWithFile } from "services/api";
import { config } from "services/config";
import dynamic from "next/dynamic";
import axios from "axios";

// Google Maps components
import {
  GoogleMap,
  LoadScript,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const libraries = ["places"]; // Google Places API

export default function AddStores() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    centerName: "",
    openingTime: "",
    closingTime: "",
    address: "",
    latitude: "",
    longitude: "",
    phone_number: "",
    email: "",
    details: "",
    images: [],
  });

  const [uploadStatus, setUploadStatus] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 39.1069, lng: -77.1909 }); // Default to Rockville, MD
  const [markerPosition, setMarkerPosition] = useState(mapCenter);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      setMarkerPosition({
        lat: parseFloat(formData.latitude),
        lng: parseFloat(formData.longitude),
      });
      setMapCenter({
        lat: parseFloat(formData.latitude),
        lng: parseFloat(formData.longitude),
      });
    }
  }, [formData.latitude, formData.longitude]);

  // ✅ Fix: Allow manual typing in the address field
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Get address from coordinates
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );

      const data = response.data;
      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        console.error("Reverse Geocoding failed:", data.status);
        return "";
      }
    } catch (error) {
      console.error("Error fetching address from coordinates:", error);
      return "";
    }
  };

  // ✅ Fix: Ensure Google Maps API is loaded before using Autocomplete
  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return; // Ensure autocomplete is available
    const place = autocompleteRef.current.getPlace();

    if (!place || !place.geometry || !place.geometry.location) {
      console.error("No valid place selected");
      return; // ✅ Prevents execution if no place is selected
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = place.formatted_address;

    setFormData((prevData) => ({
      ...prevData,
      latitude: lat,
      longitude: lng,
      address: address,
    }));

    setMapCenter({ lat, lng });
    setMarkerPosition({ lat, lng }); // ✅ Ensure marker updates
  };

  // ✅ Fix: Marker updates properly when clicking the map
  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    const address = await getAddressFromCoordinates(lat, lng);

    setFormData((prevData) => ({
      ...prevData,
      latitude: lat,
      longitude: lng,
      address: address,
    }));

    setMarkerPosition({ lat, lng }); // ✅ Fix: Move marker when clicking on the map
  };

  const handleDetailsChange = (value) => {
    setFormData({
      ...formData,
      details: value,
    });
  };

  const handleImageUpload = (e) => {
    setFormData({
      ...formData,
      images: Array.from(e.target.files),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = config.Addcenter;
      const data = { ...formData };
      delete data.images;
      const files = {};
      if (formData.images.length > 0) {
        files.file = formData.images[0];
      }
      const response = await postApiWithFile(endpoint, data, files);
      if (response.statusCode === 201) {
        setUploadStatus("Center added successfully!");
        ResetForm();
        router.push("/admin/Store-Management");
      } else {
        alert("Failed to add center!");
      }
    } catch (error) {
      console.error("Error adding center:", error);
      setUploadStatus("Failed to add center.");
    }
  };

  const ResetForm = () => {
    setFormData({
      centerName: "",
      openingTime: "",
      closingTime: "",
      address: "",
      latitude: "",
      longitude: "",
      phone_number: "",
      email: "",
      details: "",
      images: [],
    });
    setMarkerPosition(mapCenter); // ✅ Reset the marker
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <Row className="mb-3">
                <Col>
                  <h2>Add New Center</h2>
                </Col>
                <Col className="d-flex justify-content-end">
                  <Link href={"/admin/Store-Management"}>
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Store Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="centerName"
                    value={formData.centerName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <LoadScript
                    googleMapsApiKey={
                      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
                    }
                    libraries={libraries}
                  >
                    <Autocomplete
                      onLoad={(autocomplete) =>
                        (autocompleteRef.current = autocomplete)
                      }
                      onPlaceChanged={handlePlaceSelect}
                    >
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange} // ✅ Fix: Allow manual typing
                        placeholder="Type an address or select on the map..."
                      />
                    </Autocomplete>
                  </LoadScript>
                </Form.Group>

                <LoadScript
                  googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                  libraries={libraries}
                >
                  <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "350px" }}
                    center={mapCenter}
                    zoom={14}
                    onClick={handleMapClick}
                  >
                    {/* ✅ Fix: Ensure Marker is displayed correctly */}
                    {markerPosition && (
                      <Marker
                        position={markerPosition}
                        draggable={true}
                        onDragEnd={handleMapClick}
                      />
                    )}
                  </GoogleMap>
                </LoadScript>

                {/* <Form.Group className="mb-3">
                                    <Form.Label>Latitude</Form.Label>
                                    <Form.Control type="text" name="latitude" value={formData.latitude} readOnly />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Longitude</Form.Label>
                                    <Form.Control type="text" name="longitude" value={formData.longitude} readOnly />
                                </Form.Group> */}
                <Form.Group className="mb-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Opening Time</strong>{" "}
                        {/* <b style={{ color: "red" }}>*</b> */}
                      </Form.Label>
                      <Form.Control
                        type="time"
                        name="openingTime"
                        value={formData.openingTime}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <strong>Closing Time</strong>
                      </Form.Label>
                      <Form.Control
                        type="time"
                        name="closingTime"
                        value={formData.closingTime}
                        onChange={handleInputChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Details</Form.Label>
                  <ReactQuill
                    value={formData.details}
                    onChange={handleDetailsChange}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Upload Images</Form.Label>
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleImageUpload}
                  />
                </Form.Group>

                <Button type="submit" variant="primary">
                  Add Store
                </Button>
              </Form>
              {uploadStatus && <p>{uploadStatus}</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
