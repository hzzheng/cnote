import React from 'react'
import cls from './templates.module.scss'

export default ({ data }) => {
  const post = data.markdownRemark
  return (
    <div className={cls.post}>
      <h2>{post.frontmatter.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
    </div>
  )
}


export const query = graphql`
  query BlogPostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
  }
`
