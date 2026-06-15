import { Link } from 'react-router-dom'

const Welcome = () => {
  return (
    <>
        <div>Welcome</div>
    
        <Link to={"/login"}>Go to Login</Link>
    </>
  )
}

export default Welcome