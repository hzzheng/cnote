import React from 'react'
import cls from './templates.module.scss'

export default ({ data }) => {
  const post = data.markdownRemark
  const { frontmatter: { title, date } } = post;
  return (
    <div className={cls.post}>
      <h2>{title}</h2>
      <small>{date}</small>
      <div className={cls.content} dangerouslySetInnerHTML={{ __html: post.html }} />
    </div>
  )
}


export const query = graphql`
  query BlogPostQuery($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
        date
      }
      fields {
        slug
      }
    }
  }
`
