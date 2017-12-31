import React from 'react'
import Link from 'gatsby-link'
import cls from './layout.module.scss'

export default ({ children }) => (
  <div className={cls.app}>
    <header>
      <h1>CNOTE</h1>
      <ul className={cls.nav}>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/blog">Blog</Link>
        </li>
        <li>
          <Link to="/about">About</Link>
        </li>
      </ul>
    </header>
    {children()}
  </div>
)
