import axios from 'axios';
import { encryptPayload, decryptResponse } from '../utils/encryption';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
export const postApiWithFile = async (endpoint, data = {}, files = {}) => {
    const formData = new FormData();
  
    const encryptedData = encryptPayload(data);
    formData.append('data', encryptedData);
  
    // ✅ Loop through additionalImages and append each
    if (files.additionalImages && Array.isArray(files.additionalImages)) {
      files.additionalImages.forEach((imageFile) => {
        formData.append('additionalImages', imageFile);
      });
    }
   
    if (files.file) {
        formData.append('file', files.file); // Add the main file
    }
    if (files.document) {
    formData.append('document', files.document); // ✅ add document file
}

     if (files.image) {
        formData.append('image', files.image); // Add the main file
    }
  
    // ✅ Append cover image
    if (files.coverImage) {
      formData.append('coverImage', files.coverImage);
    }
       // Handle 'icon_file' if present
       if (files.icon_file) {
        formData.append('icon_file', files.icon_file); // Add the icon file
    }
  
    try {
      const response = await axios.post(endpoint, formData, {
        headers: { 'Accept': 'application/json' },
      });
      return decryptResponse(response.data);
    } catch (error) {
      console.error(`POST request with file to ${endpoint} failed:`, error);
      throw error;
    }
  };
  

export const updateApiWithFile = async (endpoint, id, data = {}, files = {}) => {
    const formData = new FormData();

    // Encrypt and append the data
    const encryptedData = encryptPayload(data);
    formData.append('data', encryptedData);

    // Handle 'file' if present (e.g., image)
    if (files.file) {
        formData.append('file', files.file);
    }

     if (files.image) {
        formData.append('image', files.image);
    }
if (files.additionalImages && Array.isArray(files.additionalImages)) {
      files.additionalImages.forEach((imageFile) => {
        formData.append('additionalImages', imageFile);
      });
    }
    // Handle 'icon_file' if present
    if (files.icon_file) {
        formData.append('icon_file', files.icon_file);
    }

    // Handle 'coverImage' if present
    if (files.coverImage) {
        formData.append('coverImage', files.coverImage);
    }

    if (files.quote_image) {
        formData.append('quote_image', files.quote_image);
    }

    if (files.career_image) {
        formData.append('career_image', files.career_image);
    }

    // Handle 'video' if present
    if (files.video) {
        formData.append('video_file', files.video); // Add the video file
    }
    if(files.note){
        formData.append('note',files.note)
    }
console.log(id,endpoint)
    try {
        // Append the `id` to the endpoint
        const endpointWithId = `${endpoint}/${id}`;
console.log(endpointWithId)
        // Make the POST request
        const response = await axios.post(endpointWithId, formData, {
            headers: {
                'Accept': 'application/json', // Ensure API accepts JSON responses
            },
        });

        // Decrypt and return the response
        return decryptResponse(response.data);
    } catch (error) {
        console.error(`Update request with file to ${endpointWithId} failed:`, error);
        throw error;
    }
};



export const updateApiWithFileinBody = async (endpoint, id, data = {}, files = {}) => {
    // Encrypt the data
    const encryptedData = encryptPayload(data);

    // Prepare the request payload
    const requestBody = {
        data: encryptedData,
        files: {}
    };

    // Attach files as Base64 strings or Binary (depending on API support)
    if (files.file) {
        requestBody.files.file = await convertFileToBase64(files.file);
    }

    if (files.icon_file) {
        requestBody.files.icon_file = await convertFileToBase64(files.icon_file);
    }

    if (files.quote_image) {
        requestBody.files.quote_image = await convertFileToBase64(files.quote_image);
    }

    if (files.career_image) {
        requestBody.files.career_image = await convertFileToBase64(files.career_image);
    }

    if (files.video) {
        requestBody.files.video_file = await convertFileToBase64(files.video);
    }

    try {
        // Append the `id` to the endpoint
        const endpointWithId = `${endpoint}/${id}`;

        // Make the POST request
        const response = await axios.post(endpointWithId, requestBody, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
        });

        // Decrypt and return the response
        return decryptResponse(response.data);
    } catch (error) {
        console.error(`Update request with file to ${endpointWithId} failed:`, error);
        throw error;
    }
};

// Helper function to convert file to Base64
const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};


// GET request function with no frontend parameters
export const getApi = async (endpoint) => {
    try {
        const response = await api.get(endpoint);

        // Decrypt response data
        return decryptResponse(response.data);
    } catch (error) {
        console.error(`GET request to ${endpoint} failed:`, error);
        throw error;
    }
};
// POST request with JSON data (encrypted payload)
export const postApi = async (endpoint, data = {}) => {
    try {
        // Encrypt JSON data
        const encryptedData = encryptPayload(data);

        const response = await api.post(endpoint, { data: encryptedData });
        

        return decryptResponse(response.data);
    } catch (error) {
        console.error(`POST request to ${endpoint} failed:`, error);
        throw error;
    }
};
