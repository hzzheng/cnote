import React from 'react'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'

import favicon from '../assets/favicon.ico'
import cls from './layout.module.scss'

require('prismjs/themes/prism-tomorrow.css')

// const active = { activeStyle: { backgroundImage: 'none' } }

export default ({ children }) => (
  <div className={cls.app}>
    <Helmet>
      <title>CNOTE</title>
      <link rel="shortcut icon" href={favicon} />
    </Helmet>
    <header>
      <h1>
        <Link to="/" className={cls.logo}>
          CNOTE
        </Link>
      </h1>
      <ul className={cls.nav}>
        {/* <li>
          <Link to="/" exact {...active}>
            HOME
          </Link>
        </li> */}
        {/* <li>
          <Link to="/about" {...active}>
            ABOUT
          </Link>
        </li> */}
      </ul>
    </header>
    {children()}
  </div>
)
