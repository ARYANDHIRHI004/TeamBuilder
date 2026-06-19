// import React from 'react'
import { Outlet } from 'react-router-dom'
import CourseSideBar from '../../components/CoursesSideBar'

const  CourseLayout = () => {
  return (
    <div className="flex justify-between w-screen  ">
      <Outlet />
      <CourseSideBar />
    </div>
  )
}

export default CourseLayout