import React from 'react'
import cls from './page.module.scss'

export default ({ data }) => {
  const { allMarkdownRemark } = data
  return (
    <div className={cls.list}>
      {
        allMarkdownRemark.edges.map(({ node }) => {
          const { frontmatter, excerpt, id } = node
          return (
            <div key={id}>
              <h5>
                {frontmatter.title}
                <span className={cls.date}>{frontmatter.date}</span>
              </h5>
              <p>{excerpt}</p>
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
          excerpt
        }
      }
    }
  }
`;
