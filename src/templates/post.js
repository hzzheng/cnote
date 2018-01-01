import React from 'react'
import ReactDisqusComments from 'react-disqus-comments'
import cls from './templates.module.scss'

export default ({ data }) => {
  const post = data.markdownRemark
  return (
    <div className={cls.post}>
      <h2>{post.frontmatter.title}</h2>
      <div className={cls.content} dangerouslySetInnerHTML={{ __html: post.html }} />

      <ReactDisqusComments
        shortname="chuguan"
        identifier={post.frontmatter.title}
        title={post.frontmatter.title}
        url={`https://chuguan.me/posts/${post.fields.slug}`}
        category_id={post.frontmatter.title}
      />
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
      fields {
        slug
      }
    }
  }
`
