import * as React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const BlogAbout = ({ data, location }) => {
    const siteTitle = data.site.siteMetadata?.title || `Title`
    const post = data.markdownRemark

    return (
        <Layout location={location} title={siteTitle}>
            <section
            dangerouslySetInnerHTML={{ __html: post.html }}
            itemProp="articleBody"
            />
        </Layout>
    )
}

export default BlogAbout

export const Head = () => <Seo title="安迪是誰" />


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