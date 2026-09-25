'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Row, Col, Form, Button, Card, Image } from 'react-bootstrap';
import Link from 'next/link';
import { postApi, updateApiWithFile } from 'services/api';
import { config } from 'services/config';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';

// Import ReactQuill dynamically for SSR compatibility
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

const libraries = ['places'];

export default function EditEvent({ params }) {
    const router = useRouter();
    const editid = params.editid;
    const autocompleteRef = useRef(null);
// Add RSVP and Membership Prices support

const [memberships, setMemberships] = useState([]);
const [membershipPrices, setMembershipPrices] = useState([]);
const [eventData, setEventData] = useState(null);


    const [formData, setFormData] = useState({
        eventname: '',
        date: '',
        time: '',
        address: '',
        format: 'In Person Seminar',
        event_type: '',
        Price: '',
        meeting_link: "", // 🆕 new fiel
        description: '',
        longitude: '',
        latitude: '',
        city: '',
        state: '',
        host_name: '',
        is_exclusive: false,
        is_rsvp: false,
        max_tickets: "",
        maxTicketsPerUser:"",
        membership_id: '',
        country: '',
        pincode: '',
        speakername: '',
        speakerdesignation: '',
        speakerdescription: '',
        is_deleted: 0,
        status: 1,
        file: null,
        icon_file: null,
        coverImage: null,
    });

    const [existingImages, setExistingImages] = useState({
        file: null,
        icon_file: null,
        coverImage: null,
    });

    const [mapCenter, setMapCenter] = useState({ lat: 37.7749, lng: -122.4194 });
    const [markerPosition, setMarkerPosition] = useState(mapCenter);
    const [previewImages, setPreviewImages] = useState({
        filePreview: null,
        icon_filePreview: null,
        coverImagePreview: null,
    });




    const [formErrors, setFormErrors] = useState({});
  
    const [successMessage, setSuccessMessage] = useState('');


    useEffect(() => {
  const fetchMemberships = async () => {
    try {
      const response = await postApi(config.GetMembershipPlans, { page: 1, pageSize: 100 });

      if (response.statusCode === 200 || response.statusCode === 201) {
        const activePlans = (response.result || []).filter(p => p.status === 1);
        setMemberships(activePlans.map(p => ({
          _id: p._id,
          name: p.plan_name
        })));
      }
    } catch (error) {
      console.error("Error fetching memberships:", error);
    }
  };

  fetchMemberships();
}, []);

// Prefill membership pricing ONLY when BOTH eventData and memberships are loaded
useEffect(() => {
  if (!eventData || memberships.length === 0) return;

  if (eventData.is_exclusive && Array.isArray(eventData.membership_pricing)) {
    const merged = memberships.map(m => {
      const existing = eventData.membership_pricing.find(
        p => p.membership_id === m._id
      );
      return {
        membership_id: m._id,
        membership_name: m.name,
        price: existing ? existing.price : ""
      };
    });

    setMembershipPrices(merged);
    setFormData(prev => ({ ...prev, is_exclusive: true }));
  }
}, [eventData, memberships]);

    useEffect(() => {
        if (editid) {
            fetchEventDetails();
            // fetchMemberships();
        }
    }, [editid]);




  const fetchEventDetails = async () => {
  try {
    const response = await postApi(config.Viewevent, { id: editid });

    if (response.statusCode === 200 || response.statusCode === 201) {
      const ev = response.event;

      // Save complete event
      setEventData(ev);

      // Format date/time for input fields
      const formattedDate = ev.date ? new Date(ev.date).toISOString().split("T")[0] : "";
      const formattedTime = ev.time ? ev.time.slice(0, 5) : "";

      // Prefill form
      setFormData({
        ...ev,
        date: formattedDate,
        time: formattedTime,
        file: null,
        icon_file: null,
        coverImage: null,
      });

      // Set existing images
      setExistingImages({
        file: ev.file,
        icon_file: ev.icon_file,
        coverImage: ev.coverImage,
      });

      // Set map
      if (ev.latitude && ev.longitude) {
        const lat = parseFloat(ev.latitude);
        const lng = parseFloat(ev.longitude);
        setMapCenter({ lat, lng });
        setMarkerPosition({ lat, lng });
      }

      // Prefill membership pricing
      if (ev.is_exclusive && Array.isArray(ev.membership_pricing)) {
        const merged = memberships.map(m => {
          const existing = ev.membership_pricing.find(p => p.membership_id === m._id);
          return {
            membership_id: m._id,
            membership_name: m.name,
            price: existing ? existing.price : ""
          };
        });

        setMembershipPrices(merged);
      }
    }
  } catch (err) {
    console.error("Error fetching event:", err);
  }
};


    // const fetchMemberships = async () => {
    //     try {
    //         const endpoint = config.GetAllMemberships;
    //         const response = await postApi(endpoint, {});
    //         setMemberships(response.memberships || []);
    //     } catch (error) {
    //         console.error('Error fetching memberships:', error);
    //     }
    // };

    useEffect(() => {
        if (formData.latitude && formData.longitude) {
            const lat = parseFloat(formData.latitude);
            const lng = parseFloat(formData.longitude);
            setMapCenter({ lat, lng });
            setMarkerPosition({ lat, lng });
        }
    }, [formData.latitude, formData.longitude]);
const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;

  // 🧠 Reset meeting link when switching away from Online format
  if (name === "format" && value !== "Online") {
    setFormData(prev => ({ ...prev, format: value, meeting_link: "" }));
  } else {
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }
};

    const handleDescriptionChange = (value) => {
        setFormData(prev => ({ ...prev, description: value }));
    };

    const handleSpeakerDescriptionChange = (value) => {
        setFormData(prev => ({ ...prev, speakerdescription: value }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, [name]: file }));
        setPreviewImages(prev => ({ ...prev, [`${name}Preview`]: previewUrl }));
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

        setFormData(prev => ({
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
            setFormData(prev => ({ 
                ...prev, 
                latitude: lat, 
                longitude: lng,
                ...addressInfo
            }));
        } else {
            setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
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
            if (data.status === 'OK' && data.results.length > 0) {
                return data.results[0];
            }
            return '';
        } catch (error) {
            console.error('Reverse geocode error:', error);
            return '';
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
        let city = '',
            state = '',
            country = '',
            pincode = '',
            latitude = addressComponents.geometry.location.lat,
            longitude = addressComponents.geometry.location.lng;

        addressComponents.address_components.forEach((comp) => {
            if (comp.types.includes('locality')) city = comp.long_name;
            if (comp.types.includes('administrative_area_level_1')) state = comp.long_name;
            if (comp.types.includes('country')) country = comp.long_name;
            if (comp.types.includes('postal_code')) pincode = comp.long_name;
        });

        const result = { city, state, country, pincode, latitude, longitude };
        if (withAddress) result.address = addressComponents.formatted_address;
        return result;
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.eventname.trim()) errors.eventname = 'Event name is required.';
        if (!formData.date) errors.date = 'Date is required.';
        if (!formData.time) errors.time = 'Time is required.';
        if (!formData.description.trim()) errors.description = 'Description is required.';
        if (!formData.speakername.trim()) errors.speakername = 'Speaker name is required.';
        if (!formData.speakerdesignation.trim()) errors.speakerdesignation = 'Speaker designation is required.';
        // if (!formData.host_name.trim()) errors.host_name = 'Host name is required.';
      // Address required ONLY for physical events
if (formData.format === "In Person Seminar" && !formData.address.trim()) {
  errors.address = "Address is required for in-person events.";
}

        if (!formData.Price || formData.Price <= 0) errors.Price = 'Valid price is required.';
        if (!formData.max_tickets || formData.max_tickets <= 0)
  errors.max_tickets = "Maximum tickets is required.";

if (formData.is_exclusive && membershipPrices.every(mp => !mp.price)) {
  errors.membershipPrices = "Please enter at least one membership price.";
}

        if (formData.is_exclusive && !formData.membership_id) {
            errors.membership_id = 'Please select a membership for exclusive events.';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

const handleSubmit = async (e) => {
  e.preventDefault();   // 🔥 prevents page refresh

  try {
    let data = { ...formData };  // define early

    // RSVP events
    if (formData.is_rsvp) {
      data.is_rsvp = true;
      data.Price = 0;
      data.membership_pricing = [];
    }

    // Exclusive events
    else if (formData.is_exclusive) {
      const validPrices = membershipPrices.filter(mp => mp.price);
      if (validPrices.length === 0) {
        alert("Please enter prices for memberships.");
        return;
      }
      data.membership_pricing = validPrices;
    }

    // cleanup files before sending
    delete data.file;
    delete data.icon_file;
    delete data.coverImage;

    data.is_exclusive = !!formData.is_exclusive;

    // handle address logic
    if (formData.format === "Online") {
      data.address = "";
      data.latitude = "";
      data.longitude = "";
      data.city = "";
      data.state = "";
      data.country = "";
      data.pincode = "";
    } else {
      if (!data.latitude && data.address) {
        const geo = await getCoordinatesFromAddress(data.address);
        data = { ...data, ...setNewAddress(geo) };
      } 
      else if (data.latitude && !data.address) {
        const addr = await getAddressFromCoordinates(data.latitude, data.longitude);
        data = { ...data, ...setNewAddress(addr, true) };
      }
    }
     if (!formData.speakername.trim()) {data.speakername="N/A"};
 if (!formData.speakerdesignation.trim()) {data.speakerdesignation="N/A"};
 if (!formData.speakerdescription.trim()){data.speakerdescription="N/A"}

    const files = {};
    if (formData.file) files.file = formData.file;
    if (formData.icon_file) files.icon_file = formData.icon_file;
    if (formData.coverImage) files.coverImage = formData.coverImage;

    const response = await updateApiWithFile(config.UpdateEvent, editid, data, files);

    if (response.statusCode === 200) {
      setSuccessMessage("Event updated successfully! 🎉");
      setTimeout(() => {
        router.push("/admin/Event-Management/Events");
      }, 1500);
    } else {
      alert("Failed to update event.");
    }
  } catch (error) {
    console.error("Error updating event:", error);
    alert(error.response?.data?.message || "An error occurred. Please try again.");
  }
};


    return (
        <Container fluid>
            <Row>
                <Col>
                    <Card className="p-4 mt-4">
                        <Card.Body>
                            <Row className="mb-3">
                                <Col><h2>Edit Event</h2></Col>
                                <Col className="d-flex justify-content-end">
                                    <Link href="/admin/Event-Management/Events">
                                        <Button variant="danger">Back</Button>
                                    </Link>
                                </Col>
                            </Row>

                            {successMessage && (
                                <div className="alert alert-success" role="alert">
                                    {successMessage}
                                </div>
                            )}

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
                                                isInvalid={!!formErrors.eventname}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.eventname}
                                            </Form.Control.Feedback>
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
      isInvalid={!!formErrors.event_type}
      required
    />
    <Form.Control.Feedback type="invalid">
      {formErrors.event_type}
    </Form.Control.Feedback>
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
                                                isInvalid={!!formErrors.date}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.date}
                                            </Form.Control.Feedback>
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
                                                isInvalid={!!formErrors.time}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.time}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                
                             {/* RSVP (Free Event) */}
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
        is_exclusive: e.target.checked ? false : prev.is_exclusive, // disable exclusive if RSVP
      }))
    }
  />
</Form.Group>

{/* Exclusive Event */}
{!formData.is_rsvp && (
  <Form.Group className="mb-3 d-flex align-items-center">
   <Form.Check
  type="checkbox"
  label="Discount For Members?"
  checked={formData.is_exclusive}
  onChange={(e) => {
    const isExclusive = e.target.checked;
    setFormData(prev => ({ ...prev, is_exclusive: isExclusive }));

    // When toggled ON, populate membershipPrices
    if (isExclusive && memberships.length > 0) {
      setMembershipPrices(
        memberships.map(m => ({
          membership_id: m._id,
          membership_name: m.name,
          price: ""
        }))
      );
    } else {
      setMembershipPrices([]);
    }
  }}
/>

  </Form.Group>
)}

{/* Membership-based pricing */}
{!formData.is_rsvp && formData.is_exclusive && (
  <>
 {formData.is_exclusive && (
  <>
    <h5>Membership-Specific Pricing</h5>

    {memberships.length === 0 && (
      <p className="text-muted">Loading membership plans...</p>
    )}

    {memberships.length > 0 && membershipPrices.map((mp, index) => (
      <Row key={mp.membership_id} className="align-items-center mb-2">
        <Col md={6}>
          <Form.Label>{mp.membership_name}</Form.Label>
        </Col>
        <Col md={6}>
          <Form.Control
            type="number"
            value={mp.price}
            placeholder={`Enter price for ${mp.membership_name}`}
            onChange={(e) => {
              const updated = [...membershipPrices];
              updated[index].price = e.target.value;
              setMembershipPrices(updated);
            }}
          />
        </Col>
      </Row>
    ))}
  </>
)}

  </>
)}
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
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>General Price ($) *</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="Price"
                                                value={formData.Price}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.Price}
                                                required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.Price}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
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

                                </Row>
{/* 🆕 Meeting Link (Visible only for Online format) */}
{formData.format === "Online" && (
  <Row>
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
          Example: https://meet.google.com/xyz-abc or Zoom meeting URL
        </Form.Text>
      </Form.Group>
    </Col>
  </Row>
)}



                         
                                {/* Event Details */}
                             
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
                                                isInvalid={!!formErrors.host_name}
                                                // required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.host_name}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Description *</Form.Label>
                                            <ReactQuill
                                                value={formData.description}
                                                onChange={handleDescriptionChange}
                                            />
                                            {formErrors.description && (
                                                <div className="text-danger mt-1">{formErrors.description}</div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Event Image</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="icon_file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            {previewImages.icon_filePreview ? (
                                                <img src={previewImages.icon_filePreview}  width={100} height={100} className="mt-2" />
                                            ) : existingImages.icon_file ? (
                                                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${existingImages.icon_file}`}  width={100} height={100} className="mt-2" />
                                            ) : null}
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Cover Image</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="coverImage"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            {previewImages.coverImagePreview ? (
                                                <img src={previewImages.coverImagePreview}  width={100} height={100} className="mt-2" />
                                            ) : existingImages.coverImage ? (
                                                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${existingImages.coverImage}`}  width={100} height={100} className="mt-2" />
                                            ) : null}
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
                                                isInvalid={!!formErrors.speakername}
                                                // required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.speakername}
                                            </Form.Control.Feedback>
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
                                                isInvalid={!!formErrors.speakerdesignation}
                                                // required
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.speakerdesignation}
                                            </Form.Control.Feedback>
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

                                {/* Speaker Image */}
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Speaker Image</Form.Label>
                                            <Form.Control
                                                type="file"
                                                name="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                            />
                                            {previewImages.filePreview ? (
                                                <img src={previewImages.filePreview}  width={100} height={100} className="mt-2" />
                                            ) : existingImages.file ? (
                                                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${existingImages.file}`}  width={100} height={100} className="mt-2" />
                                            ) : null}
                                        </Form.Group>
                                    </Col>
                                </Row>
                                {formData.format === "In Person Seminar" && (<>
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
                                                isInvalid={!!formErrors.address}
                                                required
                                            />
                                        </Autocomplete>
                                    </LoadScript>
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.address}
                                    </Form.Control.Feedback>
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
                                        mapContainerStyle={{ width: '100%', height: '350px' }}
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

                                   </>   )}
                                <Button type="submit" className='mt-5' variant="primary" >
                                    Update Event
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

