// filepath: /components/admin/AddEvent.js
"use client";
import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, Card, Image } from "react-bootstrap";
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

export default function AddEvent() {
  const router = useRouter();
  const autocompleteRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    dropdown_type:"yogaVideoCategory"
  });

  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [markerPosition, setMarkerPosition] = useState(mapCenter);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewImages, setPreviewImages] = useState({
    filePreview: null,
    icon_filePreview: null,
    coverImagePreview: null,
  });
  const [memberships, setMemberships] = useState(
    [
      { _id: 1, name: "Membership 1" },
      { _id: 2, name: "Membership 2" },
      { _id: 3, name: "Membership 3" }
    ]);

  // useEffect(() => {
  //   fetchMemberships();
  // }, []);

  const fetchMemberships = async () => {
    try {
      const endpoint = config.GetAllMemberships; // ⚠️ Make sure your config has this endpoint
      const response = await postApi(endpoint, {});
      setMemberships(response.memberships);
    } catch (error) {
      console.error("Error fetching memberships:", error);
    }
  };


  useEffect(() => {
    if (formData.latitude && formData.longitude) {
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);
      setMapCenter({ lat, lng });
      setMarkerPosition({ lat, lng });
    }
  }, [formData.latitude, formData.longitude]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, description: value }));
  };

  const handleSpeakerDescriptionChange = (value) => {
    setFormData((prev) => ({ ...prev, speakerdescription: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, [name]: file }));
    setPreviewImages((prev) => ({ ...prev, [`${name}Preview`]: previewUrl }));
  };

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setFormData((prev) => ({
      ...prev,
      address: place.formatted_address,
      latitude: lat,
      longitude: lng,
    }));

    setMapCenter({ lat, lng });
    setMarkerPosition({ lat, lng });
  };

  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    setMarkerPosition({ lat, lng });
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      const res = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
      );
      const data = res.data;
      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0];
      }
      return "";
    } catch (error) {
      console.error("Reverse geocode error:", error);
      return "";
    }
  };

  const getCoordinatesFromAddress = async (address) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const { data } = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    );
    return data.results[0];
  };

  const setNewAddress = (addressComponents, withAddress) => {
    let city = "",
      state = "",
      country = "",
      pincode = "",
      latitude = addressComponents.geometry.location.lat,
      longitude = addressComponents.geometry.location.lng;

    addressComponents.address_components.forEach((comp) => {
      if (comp.types.includes("locality")) city = comp.long_name;
      if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
      if (comp.types.includes("country")) country = comp.long_name;
      if (comp.types.includes("postal_code")) pincode = comp.long_name;
    });

    const result = { city, state, country, pincode, latitude, longitude };
    if (withAddress) result.address = addressComponents.formatted_address;
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return alert("Yoga Playlist name is required.");

    if (!formData.description.trim()) return alert("Description is required.");

    try {
      let data = { ...formData };

      const files = {
        file: formData.file,
        icon_file: formData.icon_file,
        coverImage: formData.coverImage,
      };

      const endpoint = config.Addcategory;
      const response = await postApiWithFile(endpoint, data, files);

      if (response.statusCode === 201) {
        setUploadStatus("Playlist added successfully!");
        ResetForm();
        router.push("/admin/yoga_video/Yoga");
      } else {
        alert("Failed to add Playlist!");
      }
    } catch (error) {
      console.error("Error adding Playlist:", error);
      alert(error.response?.data?.message || "Error adding Playlist");
      setUploadStatus("Failed to add Playlist.");
    }
  };

  const ResetForm = () => {
    setFormData({
      name: "",
      description: "",
      
    });
    setPreviewImages({ filePreview: null, icon_filePreview: null, coverImagePreview: null });
    setMarkerPosition(mapCenter);
  };

  return (
    <Container fluid>
      <Row>
        <Col>
          <Card className="p-4 mt-4">
            <Card.Body>
              <Row className="mb-3">
                <Col><h2>Add New Yoga Playlist</h2></Col>
                <Col className="d-flex justify-content-end">
                  <Link href={"/admin/yoga_video/Yoga"}>
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit}>
                {/* Event Basic Info */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Playlist Name *</Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Description *</Form.Label>
                      <Form.Control
                        type="text"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Button type="submit" variant="primary">
                  Add Playlist
                </Button>
              </Form>

              {uploadStatus && <p className="mt-3">{uploadStatus}</p>}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
