import React from 'react'
import { Link } from 'react-router-dom'
import './header.css'

function Header() {
  return (
    <div>
      <ul className='navb'>
        <li><Link to="/student-login">Student</Link></li>
        <li><Link to="/admin-login">Admin</Link></li>
      </ul>
    </div>
  )
}

export default Header
