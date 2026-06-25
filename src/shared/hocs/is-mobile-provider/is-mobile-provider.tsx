import { em } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { createContext, ReactNode } from 'react'

const MOBILE_QUERY = `(max-width: ${em(768)})`

// eslint-disable-next-line react-refresh/only-export-components
export const IsMobileContext = createContext<boolean>(false)

interface IsMobileProviderProps {
    children: ReactNode
}

export function IsMobileProvider({ children }: IsMobileProviderProps) {
    const isMobile = useMediaQuery(MOBILE_QUERY) ?? false

    return <IsMobileContext.Provider value={isMobile}>{children}</IsMobileContext.Provider>
}
