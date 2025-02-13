import axios from "axios";
import { LoginResponse, User } from "../types";

const API_BASE_URL = "https://localhost:7074/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem("authToken") || "{}")?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const addUser = async (user: User) => {
  try {
    const response = await apiClient.post(`/Users`, user, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error("API yanıtı:", error.response.data);
    } else {
      console.error("Error adding user:", error);
    }
    throw new Error("Kullanıcı eklenirken bir hata oluştu.");
  }
};

export const deleteUser = async (id: number) => {
  try {
    await apiClient.delete(`/Users/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Kullanıcı silinirken Axios hatası oluştu:",
        error.response?.data
      );
    } else {
      console.error("Kullanıcı silinirken genel hata oluştu:", error);
    }
    throw new Error("Kullanıcı silinirken bir hata oluştu.");
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>(`/users/login`, {
      Email: email,
      Password: password,
    });
    const { token, user } = response.data;

    // Token'ı localStorage'a kaydet
    localStorage.setItem("authToken", JSON.stringify({ token }));
    localStorage.setItem("user", JSON.stringify(user));

    return response.data;
  } catch (error) {
    let errorMessage = "Giriş sırasında bir hata oluştu.";

    if (axios.isAxiosError(error)) {
      if (error.response?.data) {
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (
          typeof error.response.data === "object" &&
          error.response.data.message
        ) {
          errorMessage = error.response.data.message;
        }
      } else {
        errorMessage = error.message;
      }
    }

    console.error("Giriş sırasında hata oluştu:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const getUserInfo = async (userId: number) => {
  try {
    const response = await apiClient.get(`/Users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Kullanıcı bilgileri alınırken bir hata oluştu:", error);
    throw new Error("Kullanıcı bilgileri alınırken bir hata oluştu");
  }
};

export const getJobs = async (userId: number) => {
  try {
    const response = await apiClient.get(`/Jobs`, {
      params: {
        userId: userId,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

export const updateJobStatus = async (id: number, status: string) => {
  try {
    await apiClient.put(`/Jobs/${id}`, { status });
  } catch (error) {
    console.error("İş durumunu güncellerken hata oluştu:", error);
    throw error;
  }
};

export const updatePassword = async (
  userId: number,
  oldPasswordHash: string,
  newPassword: string
) => {
  try {
    const response = await apiClient.post(`/Profile/password`, {
      userid: userId,
      oldpasswordhash: oldPasswordHash,
      newpasswordhash: newPassword, // Bu değeri uygun şekilde hash'leyin
      updatedat: new Date().toISOString(),
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorMessage =
        error.response.data?.message || "Şifre güncellenirken bir hata oluştu.";
      throw new Error(errorMessage);
    } else {
      // Genel hata mesajı
      throw new Error("Şifre güncellenirken beklenmedik bir hata oluştu.");
    }
  }
};
