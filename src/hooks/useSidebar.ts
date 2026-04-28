import {createContext, useContext} from "react";

type ContextType = {
    sidebarOpened: boolean;
    setSidebarOpened: (opened: boolean) => void;
}

export const SidebarContext = createContext<ContextType | undefined>(undefined);

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) throw new Error("useSidebar must be used inside AppProvider");
    return context;
};