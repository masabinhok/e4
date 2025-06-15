export function parseError(error: any): string {
  if (error.response?.status === 401) {
    return 'Invalid credentials. Please try again.';
  }
  
  if(error?.response?.data?.message){
    return error.response.data.message;
  }

  if(error.message){
    return error.message
  }

  return 'Something went wrong. Please try again.';
}