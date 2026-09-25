// filepath: /components/admin/AddEvent.js
"use client";
import { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, Button, Card, Image } from "react-bootstrap";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { postApiWithFile ,postApi } from "services/api";
import { config } from "services/config";
import dynamic from "next/dynamic";
import axios from "axios";
import { GoogleMap, LoadScript, Marker, Autocomplete } from "@react-google-maps/api";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });
import "react-quill/dist/quill.snow.css";

const libraries = ["places"];

export default function AddEvent() {
  const [membershipPrices, setMembershipPrices] = useState([]);
  const router = useRouter();
  const autocompleteRef = useRef(null);
  

  const [formData, setFormData] = useState({
    eventname: "",
    date: "",
    time: "",
    address: "",
    format: "In Person Seminar",
    event_type:"",     // 🆕 selected membership
    Price: "",
    description: "",
    longitude: "",
    latitude: "",
    city: "",
    max_tickets: "", 
    maxTicketsPerUser:"",
    state: "",
     is_rsvp: false,  
     
    meeting_link: "", // 🆕 new field
    host_name: "",          // 🆕 new field
  is_exclusive: false,    // 🆕 new checkbox
  membership_id: "", 
    country: "",
    pincode: "",
    speakername: "",
    speakerdesignation: "",
    speakerdescription: "",
    is_deleted: 0,
    status: 1,
    file: null,
    icon_file: null,
    coverImage: null,
    
  // 🆕 recurrence fields
  is_recurring: false,
  recurrence_type: "",
  recurrence_end_date: "",
  });

  const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
  const [markerPosition, setMarkerPosition] = useState(mapCenter);
  const [uploadStatus, setUploadStatus] = useState("");
  const [previewImages, setPreviewImages] = useState({
    filePreview: null,
    icon_filePreview: null,
    coverImagePreview: null,
  });

  const [memberships, setMemberships] = useState([]);

// 🔹 Fetch membership plans dynamically
useEffect(() => {
  const fetchMemberships = async () => {
    try {
      const response = await postApi(config.GetMembershipPlans, { page: 1, pageSize: 100 });
      if (response.statusCode === 200 || response.statusCode === 201) {
        const activePlans = (response.result || []).filter(p => p.status === 1);
        setMemberships(activePlans.map(p => ({ _id: p._id, name: p.plan_name })));
      }
    } catch (error) {
      console.error("Error fetching memberships:", error);
    }
  };
  fetchMemberships();
}, []);



useEffect(() => {
  if (formData.is_exclusive && memberships.length > 0) {
    const initialPrices = memberships.map(m => ({
      membership_id: m._id,
      membership_name: m.name,
      price: ""
    }));
    setMembershipPrices(initialPrices);
  } else {
    setMembershipPrices([]);
  }
}, [formData.is_exclusive, memberships]);


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

    // Extract address components
    let city = "", state = "", country = "", pincode = "";
    place.address_components.forEach((comp) => {
      if (comp.types.includes("locality")) city = comp.long_name;
      if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
      if (comp.types.includes("country")) country = comp.long_name;
      if (comp.types.includes("postal_code")) pincode = comp.long_name;
    });

    setFormData((prev) => ({
      ...prev,
      address: place.formatted_address,
      latitude: lat,
      longitude: lng,
      city: city,
      state: state,
      country: country,
      pincode: pincode,
    }));

    setMapCenter({ lat, lng });
    setMarkerPosition({ lat, lng });
  };

  const handleMapClick = async (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    
    // Get address from coordinates
    const addressData = await getAddressFromCoordinates(lat, lng);
    if (addressData) {
      const addressInfo = setNewAddress(addressData, true);
      setFormData((prev) => ({ 
        ...prev, 
        latitude: lat, 
        longitude: lng,
        ...addressInfo
      }));
    } else {
      setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
    }
    
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

  if (!formData.eventname.trim()) return alert("Event name is required.");
  if (!formData.date) return alert("Date is required.");
  if (!formData.time) return alert("Time is required.");
  if (!formData.description.trim()) return alert("Description is required.");
  // if (!formData.speakername.trim()) return alert("Speaker name is required.");
   if (!formData.maxTicketsPerUser.trim()) return alert("Maximum ticket limit per user is required.");
  // if (!formData.speakerdesignation.trim())    return alert("Speaker designation is required.");
  if (//!formData.file ||
     !formData.icon_file || !formData.coverImage)
    return alert("All two images are required.");

  try {
    // ✅ Define `data` first
    let data = { ...formData };

    // ✅ Include recurrence fields only if applicable
    if (!formData.is_recurring) {
      data.is_recurring = false;
      data.recurrence_type = null;
      data.recurrence_end_date = null;
    }

    // ✅ Handle RSVP event (free)
    if (formData.is_rsvp) {
      data.is_rsvp = true;
      data.Price = 0;
      data.membership_pricing = [];
    } 
    // ✅ Handle Exclusive event (membership pricing)
    else if (formData.is_exclusive) {
      const validPrices = membershipPrices.filter(mp => mp.price);
      if (validPrices.length === 0) {
        return alert("Please enter prices for memberships.");
      }
      data.membership_pricing = validPrices;
    }
 if (!formData.speakername.trim()) {data.speakername="N/A"};
 if (!formData.speakerdesignation.trim()) {data.speakerdesignation="N/A"};
 if (!formData.speakerdescription.trim()){data.speakerdesignation="N/A"}
    // 🧹 Clean up before sending
    delete data.file;
    delete data.icon_file;
    delete data.coverImage;
    data.is_exclusive = formData.is_exclusive ? true : false;
// 🗺️ Address + Coordinates Logic
if (formData.format === "Online") {
  // Online events do NOT require any address values
  data.address = "";
  data.latitude = "";
  data.longitude = "";
  data.city = "";
  data.state = "";
  data.country = "";
  data.pincode = "";
} else {
  // Offline: ensure coordinates/address are complete
  if (!data.latitude && data.address) {
    const geo = await getCoordinatesFromAddress(data.address);
    const newAddr = setNewAddress(geo);
    data = { ...data, ...newAddr };
  } else if (data.latitude && !data.address) {
    const addr = await getAddressFromCoordinates(data.latitude, data.longitude);
    const newAddr = setNewAddress(addr, true);
    data = { ...data, ...newAddr };
  }
}

    
    const files = {
      file: formData?.file,
      icon_file: formData.icon_file,
      coverImage: formData.coverImage,
    };

    const endpoint = config.Addevent;
    const response = await postApiWithFile(endpoint, data, files);

    if (response.statusCode === 201) {
      setUploadStatus("Event added successfully!");
      ResetForm();
      router.push("/admin/Event-Management/Events");
    } else {
      alert("Failed to add event!");
    }
  } catch (error) {
    console.error("Error adding event:", error);
    alert(error.response?.data?.message || "Error adding event");
    setUploadStatus("Failed to add event.");
  }
};



  const ResetForm = () => {
    setFormData({
      eventname: "",
      date: "",
      time: "",
      address: "",
      format: "In Person Seminar",
      event_type:"",
      Price: "",
      description: "",
      longitude: "",
      latitude: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      speakername: "",
      speakerdesignation: "",
      speakerdescription: "",
      is_deleted: 0,
      status: 1,
      file: null,
      icon_file: null,
      coverImage: null,
      
  // 🆕 recurrence fields
  is_recurring: false,
  recurrence_type: "",
  recurrence_end_date: "",
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
                <Col><h2>Add New Event</h2></Col>
                <Col className="d-flex justify-content-end">
                  <Link href={"/admin/Event-Management/Events"}>
                    <Button variant="danger">Back</Button>
                  </Link>
                </Col>
              </Row>

              <Form onSubmit={handleSubmit}>
                {/* Event Basic Info */}
                <Row>
                  <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Event Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="eventname"
                    value={formData.eventname}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
                 </Col>
             <Col md={6}>
  <Form.Group className="mb-3">
    <Form.Label>Event For *</Form.Label>
    <Form.Control
      type="text"
      name="event_type"
      value={formData.event_type}
      onChange={handleInputChange}
      placeholder="Enter event category (e.g., Yoga, Appointment, Workshop)"
      required
    />
  </Form.Group>
</Col>

                  </Row>


                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Date *</Form.Label>
                      <Form.Control
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Time *</Form.Label>
                      <Form.Control
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleInputChange}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                {/* 🆕 Event Recurrence Section */}
<h5 className="mt-4">Event Recurrence (Optional)</h5>
<Form.Group className="mb-3">
  <Form.Check
    type="checkbox"
    id="is_recurring"
    label="Repeat this event"
    checked={formData.is_recurring || false}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        is_recurring: e.target.checked,
        recurrence_type: e.target.checked ? prev.recurrence_type : null,
        recurrence_end_date: e.target.checked ? prev.recurrence_end_date : null,
      }))
    }
  />
</Form.Group>

{formData.is_recurring && (
  <Row>
    <Col md={6}>
      <Form.Group className="mb-3">
        <Form.Label>Recurrence Type</Form.Label>
        <Form.Select
          name="recurrence_type"
          value={formData.recurrence_type || ""}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Recurrence</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </Form.Select>
      </Form.Group>
    </Col>

    <Col md={6}>
      <Form.Group className="mb-3">
        <Form.Label>Repeat Until</Form.Label>
        <Form.Control
          type="date"
          name="recurrence_end_date"
          value={formData.recurrence_end_date || ""}
          onChange={handleInputChange}
          min={formData.date}
          required
        />
      </Form.Group>
    </Col>
  </Row>
)}


            <Form.Group className="mb-3 d-flex align-items-center">
  <Form.Check
    type="checkbox"
    id="isRsvp"
    label="RSVP (Free Event)"
    checked={formData.is_rsvp}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        is_rsvp: e.target.checked,
        is_exclusive: e.target.checked ? false : prev.is_exclusive, // if RSVP, disable exclusive
      }))
    }
  />
</Form.Group>


{!formData.is_rsvp && (
  <Form.Group className="mb-3 d-flex align-items-center">
    <Form.Check
      type="checkbox"
      id="isExclusive"
      label="Discount For Members ?"
      checked={formData.is_exclusive}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          is_exclusive: e.target.checked,
        }))
      }
    />
  </Form.Group>
)}


{!formData.is_rsvp && formData.is_exclusive && (
  <>
    <h5>Membership-Specific Pricing</h5>

    {memberships.length === 0 && (
      <p className="text-muted">Loading membership plans...</p>
    )}

    {memberships.length > 0 &&
      membershipPrices.map((mp, index) => (
        <Row key={mp.membership_id} className="align-items-center mb-2">
          <Col md={6}>
            <Form.Label>{mp.membership_name}</Form.Label>
          </Col>
          <Col md={6}>
            <Form.Control
              type="number"
              placeholder={`Enter price for ${mp.membership_name}`}
              value={mp.price}
              onChange={(e) => {
                const updated = [...membershipPrices];
                updated[index].price = e.target.value;
                setMembershipPrices(updated);
              }}
              required
            />
          </Col>
        </Row>
      ))}
  </>
)}

                {/* Event Details */}
                <Row className="mt-5">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Format *</Form.Label>
                      <Form.Select
                        name="format"
                        value={formData.format}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="In Person Seminar">In Person Seminar</option>
                        <option value="Online">Online</option>
                        {/* <option value="Hybrid">Hybrid</option> */}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                 
  {!formData.is_rsvp  && (
  <Col md={6}>
    <Form.Group className="mb-3">
      <Form.Label>General Price ($)*</Form.Label>
      <Form.Control
        type="number"
        name="Price"
        value={formData.Price}
        onChange={handleInputChange}
        required
      />
    </Form.Group>
  </Col>
)}
<Col md={6}>
  <Form.Group className="mb-3">
    <Form.Label>Maximum Tickets Limit *</Form.Label>
    <Form.Control
      type="number"
      name="max_tickets"
      value={formData.max_tickets}
      onChange={handleInputChange}
      placeholder="Enter maximum number of tickets"
      required
    />
  </Form.Group>
</Col>

<Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Maximum Ticket Limit Per User *</Form.Label>
                      <Form.Control
                        type="number"
                        name="maxTicketsPerUser"
                        value={formData.maxTicketsPerUser}
                        onChange={handleInputChange}
                        placeholder="Enter maximum number of tickets"
                        required
                      />
                    </Form.Group>
                  </Col>

                  {/* Host Name */}
{formData.format === "Online" && (
  <Col md={12}>
    <Form.Group className="mb-3">
      <Form.Label>Meeting Link *</Form.Label>
      <Form.Control
        type="url"
        name="meeting_link"
        value={formData.meeting_link}
        onChange={handleInputChange}
        placeholder="Enter Zoom / Google Meet link"
        required={formData.format === "Online"}
      />
      <Form.Text className="text-muted">
        Example: https://meet.google.com/xyz-abc-pqr or Zoom link
      </Form.Text>
    </Form.Group>
  </Col>
)}
                  <Row>
                    <Col md={6}>
<Form.Group className="mb-3">
  <Form.Label>Host Name 
    {/* * */}
    </Form.Label>
  <Form.Control
    type="text"
    name="host_name"
    value={formData.host_name}
    onChange={handleInputChange}
    placeholder="Enter host name"
    // required
  />
</Form.Group>
</Col>
<Col md={6}>
 <Form.Group className="mb-3">
                  <Form.Label>Description *</Form.Label>
                  <ReactQuill
                    value={formData.description}
                    onChange={handleDescriptionChange}
                  />
                </Form.Group>
</Col>
</Row>


                </Row>
                {/* 🆕 Show Meeting Link only if format is Online */}


                <Row>
                 <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Event Image *</Form.Label>
                      <Form.Control
                        type="file"
                        name="icon_file"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                      />
                      {previewImages.icon_filePreview && (
                        <Image src={previewImages.icon_filePreview} thumbnail width={100} height={100} className="mt-2" />
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Cover Image *</Form.Label>
                      <Form.Control
                        type="file"
                        name="coverImage"
                        accept="image/*"
                        onChange={handleFileChange}
                        required
                      />
                      {previewImages.coverImagePreview && (
                        <Image src={previewImages.coverImagePreview} thumbnail width={100} height={100} className="mt-2" />
                      )}
                    </Form.Group>
                  </Col>
                  </Row>

               

                {/* Speaker Info */}
                <h2 className="mt-4">Speaker Information</h2>
                <Row>
                  <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Speaker Name
                     {/* * */}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="speakername"
                    value={formData.speakername}
                    onChange={handleInputChange}
                    // required
                  />
                </Form.Group>
                </Col>
                <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Speaker Designation 
                    {/* * */}
                    </Form.Label>
                  <Form.Control
                    type="text"
                    name="speakerdesignation"
                    value={formData.speakerdesignation}
                    onChange={handleInputChange}
                    // required
                  />
                </Form.Group>
                </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Speaker Description 
                    {/* * */}
                    </Form.Label>
                  <ReactQuill
                    value={formData.speakerdescription}
                    onChange={handleSpeakerDescriptionChange}
                  />
                </Form.Group>

                {/* Images */}
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Speaker Image 
                        {/* * */}
                        </Form.Label>
                      <Form.Control
                        type="file"
                        name="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        // required
                      />
                      {previewImages.filePreview && (
                        <Image src={previewImages.filePreview} thumbnail width={100} height={100} className="mt-2" />
                      )}
                    </Form.Group>
                  </Col>
                 
                </Row>
                {formData.format === "In Person Seminar" && ( <>
    <Form.Group className="mb-3">
                  <Form.Label>Address *</Form.Label>
                  <LoadScript
                    googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                    libraries={libraries}
                  >
                    <Autocomplete
                      onLoad={(auto) => (autocompleteRef.current = auto)}
                      onPlaceChanged={handlePlaceSelect}
                    >
                      <Form.Control
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Type or select address"
                        required
                      />
                    </Autocomplete>
                  </LoadScript>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>City *</Form.Label>
                      <Form.Control
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="City"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>State *</Form.Label>
                      <Form.Control
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="State"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Country *</Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="Country"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Pincode *</Form.Label>
                      <Form.Control
                        type="text"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        placeholder="Pincode"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

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
                    {markerPosition && (
                      <Marker
                        position={markerPosition}
                        draggable={true}
                        onDragEnd={handleMapClick}
                      />
                    )}
                  </GoogleMap>
                </LoadScript>

                </>  )}

                <Button type="submit" className="mt-4" variant="primary">
                  Add Event
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
