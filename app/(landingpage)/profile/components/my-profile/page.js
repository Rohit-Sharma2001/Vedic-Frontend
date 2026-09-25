'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { postApi,postApiWithFile  } from 'services/api';
import { config } from 'services/config';
import Loader from 'services/Loader/page';
import DynamicModal3 from 'services/Pop-ups/popup3/page';

export default function  ProfileForm() {
const [initialFormData, setInitialFormData] = useState(null);

  const [userData, setUserData] = useState({})
  const [defaultAdd,setDefaultAdd]=useState({})
  const [editMode,setEditMode]=useState(false)
  const [showModal, setShowModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [loader,setLoader]=useState(false)

 const [formData, setFormData] = useState({
  name: '',
  lastName: '',

  dob: '',
  email: '',
  mobileNo: '',

  address1: '',
  address2: '',
  city: '',
  state: '',
  zipcode: '',
  country: '',
  gender: '',
});

const [existingImage, setExistingImage] = useState(null);
const [previewImage, setPreviewImage] = useState(null);
const [profileImage, setProfileImage] = useState(null);
const isDefaultProfileImage = !previewImage && !existingImage;

const handleProfileImageChange = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setProfileImage(file);
  setPreviewImage(URL.createObjectURL(file));
};

  // console.log(formData, "form data of my profile")
  async function getAddress(user) {
    try {
      setLoader(true)
      const endpoint = config.getAddress;
      const data = { user: user._id };
      const response = await postApi(endpoint, data);
      setLoader(false)
      if (response.statusCode == 200 || response.statusCode == 201) {
        
        console.log(response.data, "getAddress")
        if (response.data.data.filter((ele) => ele.primary)[0]) {
          setDefaultAdd(response.data.data.filter((ele) => ele.primary)[0])
        } else {
          setDefaultAdd(response.data.data[0])
          let temp={

          }
        }


      }

    } catch (error) {
      console.error("Error fetching categorylist:", error);
    }
  }

useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  setUserData(user);

  const filled = {
    name: user?.name || "",
    lastName: user?.lastName || "",
    dob: user?.dob || "",
    email: user?.email || "",
    mobileNo: user?.mobileNo || "",
    address1: user?.address1 || "",
    address2: user?.address2 || "",
    city: user?.city || "",
    state: user?.state || "",
    zipcode: user?.zipcode || "",
    country: user?.country || "",
    gender: user?.gender || "",
  };

  setFormData(filled);
  setInitialFormData(filled);          // ✅ save snapshot for reset
  setExistingImage(user?.image || null);

}, []);
const resetToInitial = () => {
  if (!initialFormData) return;

  setFormData(initialFormData);     // ✅ reset fields
  setFormErrors({});               // ✅ clear field errors
  setPreviewImage(null);           // ✅ remove selected preview
  setProfileImage(null);           // ✅ remove selected file
  setEditMode(false);              // ✅ optional: exit edit mode
};

  const getInitials = (name = "") => {
    
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0]?.toUpperCase() || "";
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (editMode) {
      const errors = {};
  
      if (!formData.name.trim() || !/^[A-Za-z\s]+$/.test(formData.name)) {
        errors.name = "Name is required and should contain only letters.";
      }
  
      if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) {
        errors.email = "A valid email is required.";
      }
  
      if (!String(formData.mobileNo).trim() || !/^\d{10,15}$/.test(String(formData.mobileNo))) {

        errors.mobileNo = "Mobile number must be digits only (10-15 digits).";
      }
      if (!formData.dob || new Date(formData.dob) > new Date()) {
        errors.dob = "DOB is required and cannot be in the future.";
      }
  
      setFormErrors(errors);
  
      if (Object.keys(errors).length > 0) return;
  
      try {
        setLoader(true)
        const endpoint = config.updateProfile;
       const data = {
  user_id: userData?._id,

  name: formData.name,
  lastName: formData.lastName,

  dob: formData.dob,
  email: formData.email,
  mobileNo: formData.mobileNo,

  address1: formData.address1,
  address2: formData.address2,
  city: formData.city,
  state: formData.state,
  zipcode: formData.zipcode,
  country: formData.country,
  gender: formData.gender,
};

        const files = {};
 if (profileImage) files.image = profileImage;
 console.log(userData?._id)
 const response = await postApiWithFile(endpoint,data, files);
        setLoader(false)
        if (response.statusCode == 200 || response.statusCode == 201) {
         setFormData((prev) => ({ ...prev, ...response.data }));
   setUserData(response.data);
   setExistingImage(response.data?.image || existingImage);
   setPreviewImage(null);
   setProfileImage(null);
   localStorage.setItem("user", JSON.stringify(response.data));
          setEditMode(false);
          setShowModal(true);
        }
       else if (response.statusCode == 400) {
  alert(response.message);

  // ✅ Reset form back to already-filled original details
  resetToInitial();
}

      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      setEditMode(true);
    }
  };
  

  return (
    <>
    {loader && <Loader/>}
       <div className="profilemain d-flex gap-3">
                           <figure className="position-relative">
  <img
    src={
      previewImage
        ? previewImage
        : existingImage
          ? `${process.env.NEXT_PUBLIC_API_URL}/${existingImage}`
          : "/images/landingpage/profile-img.png"
    }
    alt="Profile"
    style={{  objectFit: "cover" }}
  />

  <input
    type="file"
    className="d-none"
    id="uploadImg1"
    accept="image/*"
    onChange={handleProfileImageChange}
     disabled={!editMode}
  />

  {editMode && (
   <label htmlFor="uploadImg1" style={{ cursor: "pointer" }}>
     <div className="d-flex flex-column align-items-center">
       <img
         src="/images/landingpage/edit-white-icon.svg"
         className="pb-2"
         width="12"
         alt=""
       />
       <b>Click to change profile Image</b>
     </div>
   </label>
 )}
</figure>

                            <div className="">
                               {isDefaultProfileImage && (<>
                                <span className="fw-semibold d-block mb-1">My Profile:</span>
  <p className="fs-8">A profile photo helps us to know you and serve you better</p>
 </>)}
                            </div>
                        </div>
{/* -----------------------------Profile----------------------------------- */}


       


{/* -------------------------------Profile update----------------------------------- */}
      <div className="row">
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label> First Name *</label>
            <input type="text" name="name" className="form-control" value={formData.name} disabled={!editMode} onChange={handleChange} />
            {formErrors.name && <div className="text-danger">{formErrors.name}</div>}

          </div>
        </div>
        <div className="col-md-6">
  <div className="form-group mb-3">
    <label>Last Name</label>
    <input
      type="text"
      name="lastName"
      className="form-control"
      value={formData.lastName || ''}
      disabled={!editMode}
      onChange={handleChange}
    />
    {formErrors.lastName && <div className="text-danger">{formErrors.lastName}</div>}
  </div>
</div>


        <div className="col-md-6">
          <div className="form-group mb-3">
            <label>Email *</label>
            <input type="text" name="email" className="form-control" value={formData.email} disabled onChange={handleChange} />
            {formErrors.email && <div className="text-danger">{formErrors.email}</div>}

          </div>
        </div>

      
        <div className="col-md-6">
          <div className="form-group mb-3">
            <label>Date of Birth *</label>
            <input type="date" name="dob" className="form-control" value={formData.dob} disabled={!editMode} onChange={handleChange} max={new Date().toISOString().split("T")[0]}/>
            {formErrors.dob && <div className="text-danger">{formErrors.dob}</div>}

          </div>
        </div>

       

        <div className="col-md-6">
          <div className="form-group mb-3">
            <label>Phone *</label>
            <div className="inputMain input-group d-flex mb-3">
              {/* <button className="btn btnDrop" type="button" data-bs-toggle="dropdown">
                <Image src="/images/landingpage/flag-icon.svg" alt="flag" width={20} height={20} />
              </button> */}
              {/* <ul className="dropdown-menu">-
                <li>
                  <a className="dropdown-item" href="#">
                    <Image src="/images/landingpage/flag-icon.svg" alt="flag" width={20} height={20} />
                  </a>
                </li>
              </ul> */}
             <input
  type="number"
  name="mobileNo"
  className="form-control"
  value={formData.mobileNo}
  disabled={!editMode}
  onChange={handleChange}
/>

              {formErrors.mobileNo && <div className="text-danger">{formErrors.mobileNo}</div>}

            </div>
          </div>
        </div>

        <div className="col-md-6">
  <div className="form-group mb-3">
    <label>Gender</label>
    <select
      name="gender"
      className="form-control"
      value={formData.gender || ''}
      disabled={!editMode}
      onChange={handleChange}
    >
      <option value="">Select</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
      <option value="Prefer not to say">Prefer not to say</option>
    </select>
  </div>
</div>
<div className="col-md-6">
  <div className="form-group mb-3">
    <label>Address 1</label>
    <input
      type="text"
      name="address1"
      className="form-control"
      value={formData.address1 || ''}
      disabled={!editMode}
      onChange={handleChange}
    />
  </div>
</div>

<div className="col-md-6">
  <div className="form-group mb-3">
    <label>Address 2</label>
    <input
      type="text"
      name="address2"
      className="form-control"
      value={formData.address2 || ''}
      disabled={!editMode}
      onChange={handleChange}
    />
  </div>
</div>

<div className="col-md-6">
  <div className="form-group mb-3">
    <label>City</label>
    <input
      type="text"
      name="city"
      className="form-control"
      value={formData.city || ''}
      disabled={!editMode}
      onChange={handleChange}
    />
  </div>
</div>

<div className="col-md-6">
  <div className="form-group mb-3">
    <label>State</label>
    <input
      type="text"
      name="state"
      className="form-control"
      value={formData.state || ''}
      disabled={!editMode}
      onChange={handleChange}
    />
  </div>
</div>

<div className="col-md-6">
  <div className="form-group mb-3">
    <label>Zipcode</label>
    <input
      type="text"
      name="zipcode"
      className="form-control"
      value={formData.zipcode || ''}
      disabled={!editMode}
      onChange={handleChange}
    />
  </div>
</div>

<div className="col-md-6">
  <div className="form-group mb-3">
    <label>Country</label>
    <input
      type="text"
      name="country"
      className="form-control"
      value={formData.country || ''}
      disabled={!editMode}
      onChange={handleChange}
    />
  </div>
</div>


        <div className="col-md-12 text-end">
          <p className="fw-normal fs-9">
            This information is shared with your service provider to better serve you.
          </p>
        </div>

        <div className="text-end mb-3 mt-4">
         {editMode?<button type="button" className="btn btn-primary" onClick={handleSubmit}>
            Save Changes
          </button>:<button type="button" className="btn btn-primary" onClick={()=>{setEditMode(!editMode)}}>
            Edit
          </button>
          }
        </div>
      </div>
         <DynamicModal3
              show={showModal}
              onClose={() => setShowModal(false)}
              title={ "Success!"}
              heading={ "Profile updated successfully"}
              description={ ""}
              buttonText="Continue"
              onButtonClick={() => setShowModal(false)}
            />
    </>
  );
}