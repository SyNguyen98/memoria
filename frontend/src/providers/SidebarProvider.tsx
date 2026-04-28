import {SidebarContext} from "@hooks/useSidebar";
import {ReactNode, useMemo, useState} from "react";

function SidebarProvider({children}: { children: ReactNode }) {
    const [sidebarOpened, setSidebarOpened] = useState(false);

    const value = useMemo(() => ({
        sidebarOpened,
        setSidebarOpened,
    }), [sidebarOpened])

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
}

export default SidebarProvider;