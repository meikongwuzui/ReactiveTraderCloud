import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { FC, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { AccentName } from 'rt-theme'
import styled from 'styled-components/macro'
import OpenfinSnapshotSelection from './OpenfinSnapshotSelection'
import ReactGA from 'react-ga'

export interface ControlProps {
  minimize?: () => void
  maximize?: () => void
  close: () => void
}

const LAYOUT_ITEMS = {
  Blotter: 'stream',
  Analytics: 'chart-line',
  Pricing: 'dollar-sign',
}

const getEmptyContent = (key: string, useIcon: boolean = true) => {
  if (useIcon) {
    const icon = LAYOUT_ITEMS[key]
    if (icon) {
      return `<i style="font-size: 6rem" class="fas fa-${icon} fa-set-position" />`
    }
  }
  return key
}

export const OpenFinChrome: FC = ({ children }) => {
  //TODO: Remove this HACK once OpenFin exposes content of "empty" layout containers...
  useEffect(() => {
    //@ts-ignore
    if (!window.fin.me.isView) {
      const listenerViewAttached = (e: any) => {
        const label: string = ((e || {}).viewIdentity || {}).name || 'unknown'
        ReactGA.event({ category: 'RT - Tab', action: 'attach', label })
      }
      const listenerViewDetached = (e: any) => {
        const label: string = ((e || {}).viewIdentity || {}).name || 'unknown'
        ReactGA.event({ category: 'RT - Tab', action: 'detach', label })
      }
      const listenerViewHidden = (e: any) => {
        const layoutItems: HTMLCollectionOf<Element> = document.getElementsByClassName('lm_item')
        for (let idx in layoutItems) {
          const layoutItem = layoutItems[idx]
          if (layoutItem && layoutItem.querySelector) {
            const placeholder = layoutItem.querySelector('.wrapper_title')
            const tab = layoutItem.querySelector('.lm_tab.lm_active .lm_title')
            if (placeholder && tab) {
              placeholder.innerHTML = getEmptyContent(tab.innerHTML, false)
            }
          }
        }
      }
      const listenerWindowCreated = (e: any) => {
        const label: string = (e || {}).name || 'unknown'
        ReactGA.event({ category: 'RT - Window', action: 'open', label })
      }
      const listenerWindowClosed = (e: any) => {
        const label: string = (e || {}).name || 'unknown'
        ReactGA.event({ category: 'RT - Window', action: 'close', label })
      }

      fin.Window.getCurrent()
        .then(window => {
          window.addListener('view-attached', listenerViewAttached)
          window.addListener('view-detached', listenerViewDetached)
        })
        .catch(ex => console.warn(ex))
      fin.Application.getCurrent()
        .then(app => {
          app.addListener('view-hidden', listenerViewHidden)
          app.addListener('window-closed', listenerWindowClosed)
          app.addListener('window-created', listenerWindowCreated)
        })
        .catch(ex => console.warn(ex))

      return () => {
        fin.Window.getCurrent()
          .then(window => {
            window.removeListener('view-attached', listenerViewAttached)
            window.removeListener('view-detached', listenerViewDetached)
          })
          .catch(ex => console.warn(ex))
        fin.Application.getCurrent()
          .then(app => {
            app.removeListener('view-hidden', listenerViewHidden)
            app.removeListener('window-closed', listenerWindowClosed)
            app.removeListener('window-created', listenerWindowCreated)
          })
          .catch(ex => console.warn(ex))
      }
    }
  }, [])

  return (
    <>
      <Helmet>
        <style type="text/css">{`
        :root,
        body,
        #root {
          overflow: hidden;
          min-height: 100%;
          max-height: 100vh;
        }
    `}</style>
      </Helmet>
      <Root>{children}</Root>
    </>
  )
}

export const OpenFinHeader: React.FC<ControlProps> = ({ ...props }) => (
  <Header>
    <DragRegion />
    <OpenFinControls {...props} />
  </Header>
)

export const OpenFinFooter: React.FC = ({ ...props }) => (
  <FooterControl>
    <OpenfinSnapshotSelection />
  </FooterControl>
)

export const OpenFinControls: React.FC<ControlProps> = ({ minimize, maximize, close }) => (
  <React.Fragment>
    {minimize ? (
      <HeaderControl accent="aware" onClick={minimize} data-qa="openfin-chrome__minimize">
        <i className="fas fa-minus fa-set-position" />
      </HeaderControl>
    ) : null}
    {maximize ? (
      <HeaderControl accent="primary" onClick={maximize} data-qa="openfin-chrome__maximize">
        <i className="far fa-window-maximize" />
      </HeaderControl>
    ) : null}
    <HeaderControl accent="negative" onClick={close} data-qa="openfin-chrome__close">
      <FontAwesomeIcon icon={faTimes} />
    </HeaderControl>
  </React.Fragment>
)

export const OPENFIN_CHROME_HEADER_HEIGHT = '21px'

const Header = styled.div`
  display: flex;
  width: 100%;
  min-height: 1.5rem;
  font-size: 1rem;
  height: ${OPENFIN_CHROME_HEADER_HEIGHT};
`

const DragRegion = styled.div`
  display: flex;
  flex-grow: 1;
  -webkit-app-region: drag;
`

const HeaderControl = styled.div<{ accent?: AccentName }>`
  display: flex;
  justify-content: center;
  align-self: center;
  min-width: 2.3rem;
  padding-top: 7px;

  color: ${props => props.theme.secondary.base};
  cursor: pointer;

  &:hover {
    color: ${({ theme, accent = 'primary' }) => theme.button[accent].backgroundColor};
  }
`

const FooterControl = styled.div`
  margin-right: 0.5rem;
`

export const Root = styled.div`
  background-color: ${props => props.theme.core.darkBackground};
  color: ${props => props.theme.core.textColor};
  height: 100%;
  width: 100%;
`

export default OpenFinChrome