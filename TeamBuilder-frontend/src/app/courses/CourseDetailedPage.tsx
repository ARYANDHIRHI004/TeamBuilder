import React from 'react'
import { useParams } from 'react-router-dom'

const CourseDetailedPage = () => {

  const {courseId} = useParams()

  return (
    <div>CourseDetailedPage {courseId}</div>
  )
}

export default CourseDetailedPage