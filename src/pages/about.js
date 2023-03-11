import * as React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogAbout = ({ data, location }) => {
    const siteTitle = data.site.siteMetadata?.title || `Title`
    const post = data.markdownRemark

    return (
        <Layout location={location} title={siteTitle}>
          <article
            className="blog-post"
            itemScope
            itemType="http://schema.org/Article"
          >
            <header>
              <h1 itemProp="headline">{post.frontmatter.title}</h1>
            </header>
            <section
            dangerouslySetInnerHTML={{ __html: post.html }}
            itemProp="articleBody"
            />
          </article>
        </Layout>
    )
}

export default BlogAbout

export const Head = () => <Seo title="關於我" />


export const pageQuery = graphql`
{
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fileAbsolutePath: {regex: "/content/about/index.md/"}) {
      fileAbsolutePath
      html
      frontmatter {
        date(formatString: "YYYY-MM-DD")
        title
        description
      }
    }
}
`