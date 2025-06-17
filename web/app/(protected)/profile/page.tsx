import { fetchUser } from '@/services/auth'
import React, { useEffect } from 'react'

const Profile = () => {
  useEffect(() => {
    fetchUser();
  }, [])
  return (
    <div>Profile</div>
  )
}

export default Profile