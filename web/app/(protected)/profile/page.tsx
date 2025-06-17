'use client'
import { useAuth } from '@/store/auth'
import React from 'react'

const Profile = () => {
  const { user } = useAuth();
  return (
    <div>{user?.username}</div>
  )
}

export default Profile