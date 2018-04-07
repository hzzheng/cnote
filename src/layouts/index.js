import React from 'react'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'
import cls from './layout.module.scss'

require('prismjs/themes/prism-tomorrow.css')

const active = { activeStyle: { backgroundImage: 'none' } }

export default ({ children }) => (
  <div className={cls.app}>
    <Helmet>
      <title>Cnote</title>
    </Helmet>
    <header>
      <h1>
        <Link to="/">
          Cnote
        </Link>
      </h1>
      <ul className={cls.nav}>
        <li>
          <Link to="/" exact {...active}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/about" {...active}>
            About
          </Link>
        </li>
      </ul>
    </header>
    {children()}
  </div>
)
