import React from 'react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  return (
    <div>
      <Link to={"/courses"}>Go to courses</Link>
    </div>
  )
}

export default Dashboard