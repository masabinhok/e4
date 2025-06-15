import axiosInstance from "@/utils/axios";


export const signUp = async(username: string, password: string) =>{
  const response = await axiosInstance.post('/auth/signup', {
    username, password
  });
  return response.data;
}


export const login = async(username: string, password: string) =>{
  const response = await axiosInstance.post('/auth/login', {
    username, password
  });
  return response.data;
}

// services/auth.ts
export const logout = async () => {
  await axiosInstance.post('/auth/logout');
};
