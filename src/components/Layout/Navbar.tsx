import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/ligamaster">Liga Master</Link></li>
        <li><Link to="/torneos">Torneos</Link></li>
        <li><Link to="/login">Login</Link></li>
      </ul>
    </nav>
  )
}
