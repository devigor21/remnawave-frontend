import {
    ActionIcon,
    ActionIconGroup,
    Button,
    CopyButton,
    Group,
    Stack,
    TextInput,
    Tooltip
} from '@mantine/core'
import {
    TbCheck,
    TbClearAll,
    TbClipboard,
    TbCookie,
    TbCopy,
    TbEye,
    TbHexagon,
    TbWorld
} from 'react-icons/tb'
import { CreateApiTokenCommand } from '@remnawave/backend-contract'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { useField } from '@mantine/form'
import { modals } from '@mantine/modals'
import { useState } from 'react'

import { QueryKeys, useCreateApiToken, useGetScopes } from '@shared/api/hooks'
import { BaseOverlayHeader } from '@shared/ui/overlays/base-overlay-header'
import { ModalFooter } from '@shared/ui/modal-footer'
import { sleep } from '@shared/utils/misc'
import { queryClient } from '@shared/api'

import {
    buildScopes,
    expandScopesToKeys,
    getKindState,
    getReadKeys,
    getWriteKeys,
    ScopeResource
} from './scopes.utils'
import { ViewApiTokenContentWidget } from './view-api-token-modal.widget'
import { ScopeResourceRow } from './scope-resource-row'

const SUBPAGE_PRESET_KEYS = [
    'subscription-page-configs:list',
    'subscription-page-configs:get',
    'subscriptions:subpage-config',
    'system:metadata',
    'users:by-username'
]

interface IProps {
    isMobile: boolean
}

export const CreateApiTokenContentWidget = ({ isMobile }: IProps) => {
    const { t } = useTranslation()

    const { data: scopesData } = useGetScopes()

    const tokenNameField = useField<CreateApiTokenCommand.Request['tokenName']>({
        initialValue: '',
        validateOnChange: true,
        validate: (value) => {
            const result = CreateApiTokenCommand.RequestSchema.safeParse({ tokenName: value })
            return result.success ? null : result.error.errors[0]?.message
        }
    })

    const [selectedEndpoints, setSelectedEndpoints] = useState<Set<string>>(new Set())
    const [expanded, setExpanded] = useState<Set<string>>(new Set())

    const resources = scopesData?.resources ?? []

    const { mutate: createApiToken, isPending } = useCreateApiToken({
        mutationFns: {
            onSuccess: async (data) => {
                queryClient.refetchQueries({
                    queryKey: QueryKeys.apiTokens.getAllApiTokens.queryKey
                })
                modals.closeAll()

                await sleep(300)

                modals.open({
                    title: (
                        <BaseOverlayHeader
                            iconColor="teal"
                            IconComponent={TbCookie}
                            iconVariant="soft"
                            title={data.tokenName}
                        />
                    ),
                    fullScreen: isMobile,
                    centered: true,
                    size: 'min(800px, 90vw)',
                    children: <ViewApiTokenContentWidget isMobile={isMobile} token={data} />
                })
            }
        }
    })

    const setKeys = (keys: string[], checked: boolean) => {
        setSelectedEndpoints((prev) => {
            const next = new Set(prev)
            keys.forEach((key) => (checked ? next.add(key) : next.delete(key)))
            return next
        })
    }

    const toggleEndpoint = (key: string) => {
        setSelectedEndpoints((prev) => {
            const next = new Set(prev)
            if (next.has(key)) next.delete(key)
            else next.add(key)
            return next
        })
    }

    const toggleKind = (resource: ScopeResource, kind: 'read' | 'write') => {
        const keys = kind === 'read' ? getReadKeys(resource) : getWriteKeys(resource)
        const state = getKindState(keys, selectedEndpoints)
        setKeys(keys, state !== 'on')
    }

    const toggleExpand = (name: string) => {
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(name)) next.delete(name)
            else next.add(name)
            return next
        })
    }

    const presetRead = () => {
        const next = new Set<string>()
        resources.forEach((resource) => getReadKeys(resource).forEach((key) => next.add(key)))
        setSelectedEndpoints(next)
    }

    const presetFull = () => {
        const next = new Set<string>()
        resources.forEach((resource) =>
            resource.endpoints.forEach((endpoint) => next.add(endpoint.key))
        )
        setSelectedEndpoints(next)
    }

    const presetSubpage = () => {
        setSelectedEndpoints(new Set(SUBPAGE_PRESET_KEYS))
    }

    const handlePasteScopes = async () => {
        try {
            const text = await navigator.clipboard.readText()
            const parsed: unknown = JSON.parse(text)
            if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === 'string')) {
                throw new Error('not a string array')
            }
            setSelectedEndpoints(new Set(expandScopesToKeys(resources, parsed as string[])))
            notifications.show({
                title: 'Scopes pasted',
                message: `Imported ${parsed.length} scope(s) from clipboard`,
                color: 'teal'
            })
        } catch {
            notifications.show({
                title: 'Invalid scopes',
                message: 'Clipboard must contain a JSON array of scope strings',
                color: 'red'
            })
        }
    }

    const handleSubmit = () => {
        createApiToken({
            variables: {
                tokenName: tokenNameField.getValue(),
                scopes: buildScopes(resources, selectedEndpoints)
            }
        })
    }

    const totalSelected = selectedEndpoints.size
    const isNameInvalid = !!tokenNameField.error || tokenNameField.getValue().trim() === ''
    const canCreate = !isNameInvalid && totalSelected > 0

    return (
        <Stack gap="md">
            <TextInput
                data-autofocus
                label={t('api-tokens-card.widget.token-name')}
                placeholder="Service Bot"
                required
                {...tokenNameField.getInputProps()}
            />

            <Group gap="xs">
                <Button
                    leftSection={<TbEye size={16} />}
                    onClick={presetRead}
                    size="xs"
                    variant="default"
                >
                    Read only
                </Button>
                <Button
                    leftSection={<TbWorld size={16} />}
                    onClick={presetFull}
                    size="xs"
                    variant="default"
                >
                    {t('api-tokens-card.widget.full-access')}
                </Button>
                <Button
                    leftSection={<TbHexagon size={16} />}
                    onClick={presetSubpage}
                    size="xs"
                    variant="default"
                >
                    Subpage
                </Button>
            </Group>

            <Stack gap={6}>
                {resources.map((resource) => (
                    <ScopeResourceRow
                        endpoints={resource.endpoints}
                        expanded={expanded.has(resource.resource)}
                        key={resource.resource}
                        onToggleEndpoint={toggleEndpoint}
                        onToggleExpand={() => toggleExpand(resource.resource)}
                        onToggleKind={(kind) => toggleKind(resource, kind)}
                        resource={resource}
                        selectedEndpoints={selectedEndpoints}
                    />
                ))}
            </Stack>

            <ModalFooter isMobile={isMobile}>
                <ActionIconGroup ml="auto">
                    <Tooltip label={t('common.clear')}>
                        <ActionIcon
                            color="gray"
                            onClick={() => setSelectedEndpoints(new Set())}
                            size="input-md"
                            variant="soft"
                        >
                            <TbClearAll size={24} />
                        </ActionIcon>
                    </Tooltip>

                    <CopyButton
                        timeout={1600}
                        value={JSON.stringify(buildScopes(resources, selectedEndpoints), null, 2)}
                    >
                        {({ copied, copy }) => (
                            <ActionIcon
                                color={copied ? 'teal' : 'gray'}
                                onClick={copy}
                                size="input-md"
                                variant="soft"
                            >
                                {copied ? <TbCheck size={24} /> : <TbCopy size={24} />}
                            </ActionIcon>
                        )}
                    </CopyButton>
                    <ActionIcon
                        color="gray"
                        onClick={handlePasteScopes}
                        size="input-md"
                        variant="soft"
                    >
                        <TbClipboard size={24} />
                    </ActionIcon>
                </ActionIconGroup>

                <Button
                    color="teal"
                    disabled={!canCreate}
                    leftSection={<TbCookie size="24px" />}
                    loading={isPending}
                    onClick={handleSubmit}
                    size="md"
                    variant="soft"
                >
                    {t('common.create')}
                </Button>
            </ModalFooter>
        </Stack>
    )
}
