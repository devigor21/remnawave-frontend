import { AppShell, Box, Burger, Container, Divider, Group, ScrollArea } from '@mantine/core'
import { useClickOutside, useDisclosure, useMediaQuery } from '@mantine/hooks'
import clsx from 'clsx'
import { Outlet, ScrollRestoration } from 'react-router'

import { HeaderControls } from '@shared/ui/header-buttons'
import { HelpDrawerShared } from '@shared/ui/help-drawer'
import { SidebarLogoShared } from '@shared/ui/sidebar/sidebar-logo'
import { SidebarTitleShared } from '@shared/ui/sidebar/sidebar-title'

import { useIsLoadingRemnawaveUpdates, useRemnawaveInfo } from '@entities/dashboard/updates-store'

import classes from './Main.module.css'
import { DesktopNavigation } from './navbar/desktop-navigation.layout'
import { MobileNavigation } from './navbar/mobile-navigation.layout'

export function MainLayout() {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure()

    const isMobile = useMediaQuery(`(max-width: 64rem)`, undefined, {
        getInitialValueInEffect: false
    })

    const isHiResDesktop = useMediaQuery(`(min-width: 2048px)`, undefined, {
        getInitialValueInEffect: false
    })

    const isSocialButton = useMediaQuery(`(max-width: 40rem)`, undefined, {
        getInitialValueInEffect: false
    })

    const remnawaveInfo = useRemnawaveInfo()
    const isLoadingUpdates = useIsLoadingRemnawaveUpdates()

    const ref = useClickOutside(() => {
        if (isMobile && mobileOpened) {
            toggleMobile()
        }
    })

    const isMediaQueryReady =
        isMobile !== undefined && isSocialButton !== undefined && isHiResDesktop !== undefined

    if (!isMediaQueryReady) {
        return <div style={{ height: '100vh' }}></div>
    }

    const headerControls = (
        <HeaderControls
            githubLink="https://github.com/remnawave/panel"
            isGithubLoading={isLoadingUpdates}
            stars={remnawaveInfo.starsCount || undefined}
            telegramLink="https://t.me/remnawave"
            withGithub={!isSocialButton}
            withPrime
            withRecap={!isSocialButton}
            withRefresh={!isSocialButton}
            withSupport={!isSocialButton}
            withTelegram={!isSocialButton}
        />
    )

    if (isMobile) {
        return (
            <AppShell
                header={{ height: 64, collapsed: false, offset: false }}
                layout="alt"
                navbar={{
                    width: 300,
                    breakpoint: 'lg',
                    collapsed: { mobile: !mobileOpened, desktop: true }
                }}
                padding="md"
                transitionDuration={500}
                transitionTimingFunction="ease-in-out"
            >
                <AppShell.Header className={classes.header} withBorder={false}>
                    <Container fluid px="lg" py="xs">
                        <Group justify="space-between" style={{ flexWrap: 'nowrap' }}>
                            <Group style={{ flex: 1, justifyContent: 'flex-start' }}>
                                <Burger onClick={toggleMobile} opened={mobileOpened} size="md" />
                            </Group>
                            <Group style={{ flexShrink: 0 }}>{headerControls}</Group>
                        </Group>
                    </Container>
                </AppShell.Header>

                <AppShell.Navbar
                    className={clsx(classes.sidebarWrapper, {
                        [classes.sidebarWrapperClosedMobile]: !mobileOpened
                    })}
                    p="md"
                    pb={0}
                    ref={ref}
                    w={300}
                    withBorder={false}
                >
                    <AppShell.Section className={classes.logoSection}>
                        <Box style={{ position: 'absolute', left: '0' }}>
                            <Burger
                                hiddenFrom="lg"
                                onClick={toggleMobile}
                                opened={mobileOpened}
                                size="sm"
                            />
                        </Box>

                        <Group gap="xs" justify="center" wrap="nowrap">
                            <SidebarLogoShared />
                            <SidebarTitleShared />
                        </Group>
                    </AppShell.Section>

                    <AppShell.Section
                        className={classes.scrollArea}
                        component={ScrollArea}
                        flex={1}
                        scrollbarSize="0.2rem"
                    >
                        <MobileNavigation onClose={toggleMobile} />
                    </AppShell.Section>

                    <AppShell.Section className={classes.footerSection}>
                        {isSocialButton && (
                            <Group justify="center" mt="md" style={{ flexShrink: 0 }}>
                                <HeaderControls
                                    githubLink="https://github.com/remnawave/panel"
                                    isGithubLoading={isLoadingUpdates}
                                    stars={remnawaveInfo.starsCount || undefined}
                                    telegramLink="https://t.me/remnawave"
                                    withLanguage={false}
                                    withLogout={false}
                                    withRefresh={false}
                                    withVersion={false}
                                />
                            </Group>
                        )}
                    </AppShell.Section>
                </AppShell.Navbar>

                <AppShell.Main
                    pb="var(--mantine-spacing-md)"
                    pt="calc(var(--app-shell-header-height) + 10px)"
                >
                    <Outlet />
                    <ScrollRestoration />
                    <HelpDrawerShared />
                </AppShell.Main>
            </AppShell>
        )
    }

    return (
        <AppShell
            className={classes.appShellFadeIn}
            header={{ height: isHiResDesktop ? 64 : 116, offset: false }}
            padding="xl"
        >
            <AppShell.Header className={classes.header}>
                <div className={classes.brandRow}>
                    <Group align="stretch" gap="xs" h="100%" style={{ minWidth: 0 }} wrap="nowrap">
                        <Group gap="xs" style={{ flexShrink: 0 }} wrap="nowrap">
                            <SidebarLogoShared />
                            <SidebarTitleShared />
                        </Group>

                        {isHiResDesktop && (
                            <>
                                <Divider
                                    h="50%"
                                    orientation="vertical"
                                    style={{
                                        alignSelf: 'center',
                                        marginLeft: '10px',
                                        marginRight: '10px'
                                    }}
                                />

                                <DesktopNavigation />
                            </>
                        )}
                    </Group>

                    <Group gap="xs" style={{ flexShrink: 0 }} wrap="nowrap">
                        {headerControls}
                    </Group>
                </div>
                {!isHiResDesktop && (
                    <div className={classes.navRowDesktop}>
                        <DesktopNavigation />
                    </div>
                )}
            </AppShell.Header>

            <AppShell.Main
                pl={isHiResDesktop ? '10vw' : undefined}
                pr={isHiResDesktop ? '10vw' : undefined}
                pt="calc(var(--app-shell-header-height) + var(--mantine-spacing-md))"
            >
                <Outlet />
                <ScrollRestoration />
            </AppShell.Main>

            <HelpDrawerShared />
        </AppShell>
    )
}
