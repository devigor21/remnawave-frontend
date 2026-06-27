import { ActionIcon, CopyButton } from '@mantine/core'
import { PiCheck, PiCopy } from 'react-icons/pi'

import classes from './copyable-field.module.css'

export const CopyableFieldShared = ({
    label,
    value,
    leftSection,
    size = 'sm'
}: {
    label?: React.ReactNode | string
    leftSection?: React.ReactNode
    size?: 'lg' | 'md' | 'sm' | 'xl' | 'xs'
    value: number | string
}) => {
    const text = value.toString()

    return (
        <CopyButton timeout={2000} value={text}>
            {({ copied, copy }) => (
                <div className={classes.root}>
                    {label != null && label !== '' && (
                        <span className={classes.label}>{label}</span>
                    )}

                    <div
                        className={classes.field}
                        data-size={size}
                        onClick={copy}
                        role="button"
                        tabIndex={-1}
                    >
                        {leftSection && <span className={classes.leftSection}>{leftSection}</span>}

                        <span className={classes.value}>{text}</span>

                        <ActionIcon
                            className={classes.copyButton}
                            color={copied ? 'teal' : 'gray'}
                            onClick={copy}
                            size="sm"
                            variant="subtle"
                        >
                            {copied ? <PiCheck size="16px" /> : <PiCopy size="16px" />}
                        </ActionIcon>
                    </div>
                </div>
            )}
        </CopyButton>
    )
}
