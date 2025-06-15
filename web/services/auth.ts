import axiosInstance from "@/utils/axios";


export const signUp = async(username: string, password: string) =>{
  try{
    const response = await axiosInstance.post('/auth/signup', {
      username, password
    });
    return response.data;
  }
  catch(err: any){
    throw err;
  }
}


export const login = async(username: string, password: string) =>{
  try{
    const response = await axiosInstance.post('/auth/login', {
      username, password
    });
    return response.data;
  }
  catch(err: any){
    throw err;
  }

}

export const fetchUser = async()=>{
  try{
    const response = await axiosInstance.get('/users/me');
    console.log(response);
  }
  catch(err: any){
    throw err;
  }
}

// services/auth.ts
export const logout = async () => {
  await axiosInstance.post('/auth/logout');
};
