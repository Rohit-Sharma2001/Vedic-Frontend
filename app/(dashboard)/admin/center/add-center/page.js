"use client";

import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postApiWithFile } from "services/api";
import { config } from "services/config";
import dynamic from "next/dynamic";
import axios from "axios";

import { GoogleMap, LoadScript, Marker, Autocomplete } from "@react-google-maps/api";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const libraries = ["places"];

function pickComponent(components, type) {
  return components.find((c) => Array.isArray(c.types) && c.types.includes(type)) || null;
}

/**
 * Convert Google Geocode result into fields APIs like Shippo usually expect:
 * street1/street2, city, state(code), zip, country(code) + lat/lng.
 */
function toAddressFields(geoResult) {
  const comps = geoResult?.address_components || [];

  const streetNumber = (pickComponent(comps, "street_number") || {}).short_name || "";
  const route = (pickComponent(comps, "route") || {}).short_name || "";
  const subpremise = (pickComponent(comps, "subpremise") || {}).short_name || "";
  const premise = (pickComponent(comps, "premise") || {}).short_name || "";

  const city =
    ((pickComponent(comps, "locality") || {}).short_name ||
      (pickComponent(comps, "postal_town") || {}).short_name ||
      (pickComponent(comps, "administrative_area_level_2") || {}).short_name ||
      "");

  const state = ((pickComponent(comps, "administrative_area_level_1") || {}).short_name || "");
  const zip = ((pickComponent(comps, "postal_code") || {}).short_name || "");
  const country = ((pickComponent(comps, "country") || {}).short_name || "");

  const lat = geoResult?.geometry?.location?.lat;
  const lng = geoResult?.geometry?.location?.lng;

  const street1 = [streetNumber, route].filter(Boolean).join(" ").trim();
  const street2 = [subpremise ? `#${subpremise}` : "", premise].filter(Boolean).join(" ").trim();

  return {
    address: geoResult?.formatted_address || "",
    latitude: lat,
    longitude: lng,
    street1,
    street2,
    city,
    state,    // e.g. "MD"
    country,  // e.g. "US"
    zip,      // common key
    pincode: zip, // keep if your backend expects "pincode"
  };
}

export default function AddCenter() {
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
  const [mapCenter, setMapCenter] = useState({ lat: 39.1069, lng: -77.1909 });
  const [markerPosition, setMarkerPosition] = useState(mapCenter);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png"]; // jpg/jpeg + png

const [imageError, setImageError] = useState("");

  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      const lat = Number(formData.latitude);
      const lng = Number(formData.longitude);
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        setMarkerPosition({ lat, lng });
        setMapCenter({ lat, lng });
      }
    }
  }, [formData.latitude, formData.longitude]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );

      const data = res.data;
      if (data.status === "OK" && data.results?.length > 0) return data.results[0];
      console.error("Reverse Geocoding failed:", data.status, data.error_message);
      return null;
    } catch (err) {
      console.error("Error fetching address from coordinates:", err);
      return null;
    }
  };

  const getCoordinatesFromAddress = async (addr) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const encoded = encodeURIComponent(addr); // ✅ FIX: proper encoding (no {} wrapping)
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}`
    );

    if (data.status !== "OK" || !data.results?.length) {
      throw new Error(`Geocode failed: ${data.status} ${data.error_message || ""}`.trim());
    }
    return data.results[0];
  };

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();

    if (!place?.geometry?.location) {
      console.error("No valid place selected");
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const address = place.formatted_address || "";

    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng, address }));
    setMapCenter({ lat, lng });
    setMarkerPosition({ lat, lng });
  };

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setMarkerPosition({ lat, lng });
  };

  const handleDetailsChange = (value) => {
    setFormData((prev) => ({ ...prev, details: value }));
  };

  const handleImageUpload = (e) => {
  const files = Array.from(e.target.files || []);
  setImageError("");

  // validate all selected files
  const invalidType = files.find((f) => !ALLOWED_TYPES.includes(f.type));
  if (invalidType) {
    setImageError("Only JPG/JPEG and PNG images are allowed.");
    e.target.value = ""; // clear selection
    setFormData((prev) => ({ ...prev, images: [] }));
    return;
  }

  const tooLarge = files.find((f) => f.size > MAX_FILE_SIZE);
  if (tooLarge) {
    setImageError("Each image must be less than 10 MB.");
    e.target.value = ""; // clear selection
    setFormData((prev) => ({ ...prev, images: [] }));
    return;
  }

  setFormData((prev) => ({ ...prev, images: files }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.details?.trim()) return alert("Details are required.");
    if (!formData.images?.length) return alert("At least one image is required.");
const invalidType = formData.images.find((f) => !ALLOWED_TYPES.includes(f.type));
if (invalidType) return alert("Only JPG/JPEG and PNG images are allowed.");

const tooLarge = formData.images.find((f) => f.size > MAX_FILE_SIZE);
if (tooLarge) return alert("Each image must be less than 10 MB.");

    try {
      const endpoint = config.Addcenter;
      let data = { ...formData };

      const hasLatLng = !!data.latitude && !!data.longitude;
      const hasAddress = !!data.address?.trim();

      // ✅ FIX: your old OR logic made conditions always true.
      if (!hasLatLng && hasAddress) {
        const geo = await getCoordinatesFromAddress(data.address);
        data = { ...data, ...toAddressFields(geo) };
      } else if (hasLatLng && !hasAddress) {
        const rev = await getAddressFromCoordinates(Number(data.latitude), Number(data.longitude));
        if (rev) data = { ...data, ...toAddressFields(rev) };
      } else if (hasLatLng && hasAddress) {
        // Optional: enrich with structured fields even if both are present
        const geo = await getCoordinatesFromAddress(data.address);
        data = { ...data, ...toAddressFields(geo) };
      }

      // Send only one file (as your code does)
      delete data.images;
      const files = {};
      if (formData.images.length > 0) files.file = formData.images[0];

      const response = await postApiWithFile(endpoint, data, files);

      if (response.statusCode === 201) {
        setUploadStatus("Center added successfully!");
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
        setMarkerPosition(mapCenter);
        router.push("/admin/center");
        return;
      }

      alert(response.error || "Failed to add center.");
      setUploadStatus("Failed to add center.");
    } catch (err) {
      console.error("Error adding center:", err);

      // ✅ If postApiWithFile uses axios internally, this will show backend message
      const backendMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Request failed";

      console.error("Backend status/data:", err?.response?.status, err?.response?.data);
      alert(backendMsg);
      setUploadStatus("Failed to add center.");
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <Row className="mb-3">
                <Col><h2>Add New Center</h2></Col>
                <Col className="d-flex justify-content-end">
                  <Link href={"/admin/center"}>
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Center Name <span style={{ color: "red" }}>*</span></Form.Label>
                  <Form.Control type="text" name="centerName" value={formData.centerName} onChange={handleInputChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address <span style={{ color: "red" }}>*</span></Form.Label>
                  <LoadScript
                    googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                    libraries={libraries}
                  >
                    <Autocomplete
                      onLoad={(ac) => (autocompleteRef.current = ac)}
                      onPlaceChanged={handlePlaceSelect}
                    >
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Type an address or select on the map..."
                        required
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
                    <Marker position={markerPosition} draggable onDragEnd={handleMapClick} />
                  </GoogleMap>
                </LoadScript>

                <Form.Group className="mb-3">
                  <Form.Label>Phone Number <span style={{ color: "red" }}>*</span></Form.Label>
                  <Form.Control type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email <span style={{ color: "red" }}>*</span></Form.Label>
                  <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Opening Time <span style={{ color: "red" }}>*</span></Form.Label>
                      <Form.Control type="time" name="openingTime" value={formData.openingTime} onChange={handleInputChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Closing Time <span style={{ color: "red" }}>*</span></Form.Label>
                      <Form.Control type="time" name="closingTime" value={formData.closingTime} onChange={handleInputChange} required />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Details <span style={{ color: "red" }}>*</span></Form.Label>
                  <ReactQuill value={formData.details} onChange={handleDetailsChange} />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Upload Images <span style={{ color: "red" }}>*</span></Form.Label>
                <Form.Control
  type="file"
  multiple
  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
  onChange={handleImageUpload}
  required
/>
{imageError && <div className="text-danger mt-1">{imageError}</div>}

                </Form.Group>

                <Button type="submit" variant="primary">Add Center</Button>
              </Form>

              {uploadStatus && <p>{uploadStatus}</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
