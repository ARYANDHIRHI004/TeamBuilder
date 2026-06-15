// import React from 'react'
import { Outlet } from 'react-router-dom'
import SideBar from '../../components/SideBar'

const  CourseLayout = ({children}:any) => {
  return (
    <div className="flex">
      <Outlet />
      <SideBar />
    </div>
  )
}

export default CourseLayout