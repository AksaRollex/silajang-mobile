import axios from '@/src/libs/axios';

// Ganti URL dengan endpoint API Anda
const API_URL = '/dashboard';

export const fetchDashboardData = async (year, month, requestType) => {
  try {
    const response = await axios.post(API_URL, {
      tahun: year,
      bulan: month,
      jenisPermohonan: requestType,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching data: ", error);
    throw error;
  }
};
