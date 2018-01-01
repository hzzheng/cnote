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
        identifier="chuguanisme"
        title="comments"
        url="https://chuguan.me"
        category_id="8"
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
    }
  }
`
