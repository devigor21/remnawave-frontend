import { TbCheck, TbCookie, TbCopy, TbDots, TbEye, TbId, TbTrash } from 'react-icons/tb'
import { ActionIcon, Box, CopyButton, Group, Menu, Text } from '@mantine/core'
import { FindAllApiTokensCommand } from '@remnawave/backend-contract'
import { useTranslation } from 'react-i18next'
import { modals } from '@mantine/modals'

import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { QueryKeys, useDeleteApiToken } from '@shared/api/hooks'
import { formatTimeUtil } from '@shared/utils/time-utils'
import { useIsMobile } from '@shared/hooks'
import { queryClient } from '@shared/api'

import { ViewApiTokenContentWidget } from './modals/view-api-token-modal.widget'
import classes from './api-token-card.module.css'

interface IProps {
    apiToken: FindAllApiTokensCommand.Response['response']['apiKeys'][number]
}

export const ApiTokenItem = ({ apiToken }: IProps) => {
    const { t, i18n } = useTranslation()
    const isMobile = useIsMobile()

    const { mutate: deleteApiToken, isPending: isDeletingApiToken } = useDeleteApiToken({
        mutationFns: {
            onSuccess: async () => {
                await queryClient.refetchQueries({
                    queryKey: QueryKeys.apiTokens.getAllApiTokens.queryKey
                })
            }
        }
    })

    const isFull = apiToken.scopes.includes('*')
    const hasScopes = isFull || apiToken.scopes.length > 0

    const getDotColor = () => {
        if (isFull) return 'var(--mantine-color-teal-5)'
        if (hasScopes) return 'var(--mantine-color-cyan-5)'
        return 'var(--mantine-color-dark-3)'
    }
    const dotColor = getDotColor()

    return (
        <Box className={classes.tokenRow}>
            <Group gap="sm" style={{ minWidth: 0 }} wrap="nowrap">
                <Box
                    style={{
                        background: dotColor,
                        borderRadius: '50%',
                        flexShrink: 0,
                        height: 8,
                        width: 8
                    }}
                />
                <Text fw={500} size="sm" truncate="end">
                    {apiToken.tokenName}
                </Text>
            </Group>

            <Text c="dimmed" ff="monospace" size="xs" truncate="end">
                {isFull ? t('api-tokens-card.widget.full-access') : apiToken.scopes.length}{' '}
            </Text>

            <Text c="dimmed" size="xs" truncate="end" visibleFrom="sm">
                {formatTimeUtil({
                    time: apiToken.createdAt,
                    template: 'TIME_FIRST_DATETIME',
                    language: i18n.language
                })}
            </Text>

            <Menu position="bottom-end" shadow="lg" trigger="click-hover" width={190}>
                <Menu.Target>
                    <ActionIcon
                        color="gray"
                        onClick={(event) => event.stopPropagation()}
                        size="md"
                        variant="subtle"
                    >
                        <TbDots size={18} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown onClick={(event) => event.stopPropagation()}>
                    <Menu.Item
                        leftSection={<TbEye size={15} />}
                        onClick={() => {
                            modals.open({
                                title: (
                                    <BaseOverlayHeader
                                        iconColor="teal"
                                        IconComponent={TbCookie}
                                        iconVariant="soft"
                                        subtitle={formatTimeUtil({
                                            time: apiToken.createdAt,
                                            template: 'TIME_FIRST_DATETIME',
                                            language: i18n.language
                                        })}
                                        title={apiToken.tokenName}
                                    />
                                ),
                                fullScreen: isMobile,
                                centered: true,
                                size: 'min(800px, 90vw)',
                                children: (
                                    <ViewApiTokenContentWidget
                                        isMobile={isMobile}
                                        token={apiToken}
                                    />
                                )
                            })
                        }}
                    >
                        {t('common.view')}
                    </Menu.Item>
                    <Menu.Divider />
                    <CopyButton timeout={1600} value={apiToken.token}>
                        {({ copied, copy }) => (
                            <Menu.Item
                                closeMenuOnClick={false}
                                leftSection={copied ? <TbCheck size={15} /> : <TbCopy size={15} />}
                                onClick={copy}
                            >
                                {copied
                                    ? t('common.copied')
                                    : t('api-tokens-card.widget.copy-token')}
                            </Menu.Item>
                        )}
                    </CopyButton>
                    <Menu.Item
                        leftSection={<TbId size={15} />}
                        onClick={() => navigator.clipboard?.writeText(apiToken.uuid)}
                    >
                        {t('common.copy-uuid')}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                        color="red"
                        disabled={isDeletingApiToken}
                        leftSection={<TbTrash size={15} />}
                        onClick={() => deleteApiToken({ route: { uuid: apiToken.uuid } })}
                    >
                        {t('common.delete')}
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Box>
    )
}
