import React from 'react'
import Link from 'gatsby-link'
import cls from './page.module.scss'

export default ({ data }) => {
  const { allMarkdownRemark } = data
  return (
    <div className={cls.list}>
      {
        allMarkdownRemark.edges.map(({ node }) => {
          const {
            frontmatter, excerpt, fields, id
          } = node

          return (
            <div key={id}>
              <h3>
                <Link to={fields.slug}>{frontmatter.title}</Link>
                <span className={cls.date}>{frontmatter.date}</span>
              </h3>
              <p className={cls.excerpt}>{excerpt}</p>
            </div>
          )
        })
      }
    </div>
  )
}

export const query = graphql`
  query IndexQuery {
    allMarkdownRemark {
      edges {
        node {
          id
          frontmatter {
            title
            date(formatString: "DD MMMM, YYYY")
          }
          fields {
            slug
          }
          excerpt
        }
      }
    }
  }
`;
