import React, { Component } from 'react'
import cls from './templates.module.scss'

export default class extends Component {
  componentDidMount() {
    this.highlight()
  }

  highlight() {
    setTimeout(() => {
      if (window.hljs) hljs.initHighlighting()
    }, 1000)
  }

  render() {
    const { data } = this.props
    const post = data.markdownRemark
    return (
      <div className={cls.post}>
        <h2>{post.frontmatter.title}</h2>
        <div dangerouslySetInnerHTML={{ __html: post.html }} />
      </div>
    )
  }
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
