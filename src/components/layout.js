import * as React from "react"
import { Link } from "gatsby"

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`
  const isRootPath = location.pathname === rootPath
  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <header className="global-header">
        <Link className="main-heading" to="/">{title}</Link>

        <div className="global-header-spacing"></div>

        <div className="global-header-action">
          <Link className="heading-link" to="/">首頁</Link>
          <Link className="heading-link" to="/about">關於</Link>
        </div>
      </header>
      <main className="global-main">{children}</main>
      <footer className="global-footer">
        © {new Date().getFullYear()}, Built with
        {` `}
        <a href="https://www.gatsbyjs.com">Gatsby</a>
      </footer>
    </div>
  )
}

export default Layout
