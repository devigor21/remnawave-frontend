import { CreateApiTokenCommand, FindAllApiTokensCommand } from '@remnawave/backend-contract'
import { ActionIcon, ActionIconGroup, Button, CopyButton, Stack } from '@mantine/core'
import { TbCheck, TbCopy } from 'react-icons/tb'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import { modals } from '@mantine/modals'

import { CopyableCodeBlock } from '@shared/ui/copyable-code-block'
import { ModalFooter } from '@shared/ui/modal-footer'
import { useGetScopes } from '@shared/api/hooks'

import { countSelected, expandScopesToKeys } from './scopes.utils'
import { ScopeResourceRow } from './scope-resource-row'

interface IProps {
    isMobile: boolean
    token:
        | CreateApiTokenCommand.Response['response']
        | FindAllApiTokensCommand.Response['response']['apiKeys'][number]
}

export const ViewApiTokenContentWidget = ({ isMobile, token }: IProps) => {
    const { t } = useTranslation()

    const { data: scopesData } = useGetScopes()
    const resources = scopesData?.resources ?? []

    const [expanded, setExpanded] = useState<Set<string>>(new Set())

    const selectedEndpoints = useMemo(
        () => new Set(expandScopesToKeys(resources, token.scopes)),
        [resources, token.scopes]
    )

    const grantedResources = resources.filter(
        (resource) => countSelected(resource.endpoints, selectedEndpoints) > 0
    )

    const toggleExpand = (name: string) => {
        setExpanded((prev) => {
            const next = new Set(prev)
            if (next.has(name)) next.delete(name)
            else next.add(name)
            return next
        })
    }

    return (
        <Stack>
            <Stack gap="md" pb="xs">
                <CopyableCodeBlock value={token.token} />

                <Stack gap={6}>
                    {grantedResources.map((resource) => (
                        <ScopeResourceRow
                            endpoints={resource.endpoints}
                            expanded={expanded.has(resource.resource)}
                            key={resource.resource}
                            onToggleExpand={() => toggleExpand(resource.resource)}
                            readOnly
                            resource={resource}
                            selectedEndpoints={selectedEndpoints}
                        />
                    ))}
                </Stack>
            </Stack>

            <ModalFooter isMobile={isMobile}>
                <ActionIconGroup ml="auto">
                    <CopyButton timeout={1600} value={JSON.stringify(token.scopes, null, 2)}>
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
                </ActionIconGroup>

                <Button color="teal" onClick={() => modals.closeAll()} size="md" variant="light">
                    {t('common.close')}
                </Button>
            </ModalFooter>
        </Stack>
    )
}
