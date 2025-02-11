import axios from 'axios';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

export const uploadDocument = async (file: File, mortgageApplicationId: string, category: string, token: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('mortgageApplicationId', mortgageApplicationId); // Add mortgage app ID
  formData.append('category', category); // Add category

  const response = await axios.post(`${API_URL}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`, // Include the auth token
    },
  });

  return response.data;
}; 