import {createContext, useContext} from "react";

type ContextType = {
    showAppLoader: () => void;
    hideAppLoader: () => void;
    showSnackbar: (type: 'success' | 'warning' | 'error', message: string) => void;
}

export const UIFeedbackContext = createContext<ContextType | undefined>(undefined);

export const useUIFeedback = () => {
    const context = useContext(UIFeedbackContext);
    if (!context) throw new Error("useUIFeedbackContext must be used inside UIFeedbackProvider");
    return context;
};