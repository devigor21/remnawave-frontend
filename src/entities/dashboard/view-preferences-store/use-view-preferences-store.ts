import { create } from 'zustand'
import { createJSONStorage, devtools, persist } from 'zustand/middleware'

import {
    CONFIG_PROFILES_VIEW_MODE,
    HOSTS_VIEW_MODE,
    IActions,
    IState,
    NODES_VIEW_MODE
} from './interfaces'

const initialState: IState = {
    nodesViewMode: NODES_VIEW_MODE.CARDS,
    nodesActiveTag: null,
    configProfilesViewMode: CONFIG_PROFILES_VIEW_MODE.PROFILES,
    hostsViewMode: HOSTS_VIEW_MODE.CARDS,
    hostsActiveTag: null
}

export const useViewPreferencesStore = create<IActions & IState>()(
    persist(
        devtools(
            (set) => ({
                ...initialState,
                actions: {
                    setNodesViewMode: (mode) => set({ nodesViewMode: mode }),
                    setNodesActiveTag: (tag) => set({ nodesActiveTag: tag }),
                    setConfigProfilesViewMode: (mode) => set({ configProfilesViewMode: mode }),
                    setHostsViewMode: (mode) => set({ hostsViewMode: mode }),
                    setHostsActiveTag: (tag) => set({ hostsActiveTag: tag }),
                    resetState: () => set({ ...initialState })
                }
            }),
            { name: 'viewPreferencesStore', anonymousActionType: 'viewPreferencesStore' }
        ),
        {
            name: 'viewPreferencesStore',
            version: 1,
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                nodesViewMode: state.nodesViewMode,
                nodesActiveTag: state.nodesActiveTag,
                configProfilesViewMode: state.configProfilesViewMode,
                hostsViewMode: state.hostsViewMode,
                hostsActiveTag: state.hostsActiveTag
            }),
            migrate: () => initialState
        }
    )
)

export const useNodesViewMode = () => useViewPreferencesStore((state) => state.nodesViewMode)
export const useNodesActiveTag = () => useViewPreferencesStore((state) => state.nodesActiveTag)
export const useConfigProfilesViewMode = () =>
    useViewPreferencesStore((state) => state.configProfilesViewMode)
export const useViewPreferencesStoreActions = () =>
    useViewPreferencesStore((state) => state.actions)
export const useHostsViewMode = () => useViewPreferencesStore((state) => state.hostsViewMode)
export const useHostsActiveTag = () => useViewPreferencesStore((state) => state.hostsActiveTag)
