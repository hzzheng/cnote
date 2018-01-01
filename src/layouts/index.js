import React from 'react'
import Link from 'gatsby-link'
import Helmet from 'react-helmet'
import cls from './layout.module.scss'

const active = { activeStyle: { backgroundImage: 'none' } }

export default ({ children }) => (
  <div className={cls.app}>
    <Helmet>
      <title>Cnote</title>
      <link
        rel="stylesheet"
        href="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/styles/default.min.css"
      />
      <script src="//cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js" />
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
          <Link to="/blog" {...active}>
            Blog
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
