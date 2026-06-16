// import React from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../../components/SideBar'

const  CourseLayout = () => {
  return (
    <div className="flex">
      <Outlet />
      <SideBar />
    </div>
  )
}

export default CourseLayout