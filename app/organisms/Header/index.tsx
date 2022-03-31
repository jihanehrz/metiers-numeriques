import classnames from 'classnames'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

import { NavLink } from '../../atoms/NavLink'
import { Brand } from './Brand'
import { Toolbar } from './Toolbar'

const StyledHeader = styled.header`
  position: sticky;
  top: 0px;
  z-index: 2;

  @media screen and (min-width: 992px) {
    box-shadow: none;
  }
`

const HeaderMenu = styled.div`
  box-shadow: none !important;
  border-bottom: solid 1px var(--border-default-grey);
  border-top: solid 1px var(--border-default-grey);
`

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const headerMenuClassName = classnames('fr-header__menu', 'fr-modal', {
    'fr-modal--opened': isMenuOpen,
  })

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen)
  }, [isMenuOpen])

  return (
    <StyledHeader className="fr-header" role="banner">
      <div className="fr-header__body">
        <div className="fr-container">
          <div className="fr-header__body-row">
            <Brand onToggleMenu={toggleMenu} />

            <Toolbar />
          </div>
        </div>
      </div>

      <HeaderMenu className={headerMenuClassName} id="header-menu" role="dialog">
        <div className="fr-container">
          <button aria-controls="header-menu" className="fr-link--close fr-link" onClick={toggleMenu} type="button">
            Fermer
          </button>
          <div className="fr-header__menu-links" />
          <nav aria-label="Menu principal" className="fr-nav" role="navigation">
            <ul className="fr-nav__list">
              <NavLink aria-current={router.pathname === '/' ? 'page' : undefined} className="fr-nav__link" href="/">
                Accueil
              </NavLink>
              <NavLink
                aria-current={router.pathname === '/emplois' ? 'page' : undefined}
                className="fr-nav__link"
                href="/emplois"
              >
                Les offres d’emplois
              </NavLink>
              <NavLink
                aria-current={router.pathname === '/institutions' ? 'page' : undefined}
                className="fr-nav__link"
                href="/institutions"
              >
                Les institutions
              </NavLink>
            </ul>
          </nav>
        </div>
      </HeaderMenu>
    </StyledHeader>
  )
}
