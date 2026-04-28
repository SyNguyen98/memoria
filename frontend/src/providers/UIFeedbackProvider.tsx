import {ReactNode, useMemo, useState} from "react";
import AppLoader from "@components/app-loader/AppLoader.tsx";
import {UIFeedbackContext} from "@hooks/useUIFeedback.ts";
import {Alert, Snackbar} from "@mui/material";

function UIFeedbackProvider({children}: { children: ReactNode }) {
    const [loaderOpen, setLoaderOpen] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [type, setType] = useState<'success' | 'warning' | 'error'>('success');
    const [message, setMessage] = useState('');

    const handleOpenSnackbar = (type: 'success' | 'warning' | 'error', message: string) => {
        setSnackbarOpen(true);
        setType(type);
        setMessage(message);
    }

    const value = useMemo(() => ({
        showAppLoader: () => setLoaderOpen(true),
        hideAppLoader: () => setLoaderOpen(false),
        showSnackbar: () => handleOpenSnackbar,
    }), [])

    return (
        <UIFeedbackContext.Provider value={value}>
            {children}
            {loaderOpen && (
                <div className="app-loader-container" style={{
                    position: "fixed",
                    width: "100vw",
                    height: "100vh",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                    top: 0,
                    zIndex: 9999
                }}>
                    <AppLoader/>
                </div>
            )}

            <Snackbar open={snackbarOpen} autoHideDuration={3000}
                      anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
                      onClose={() => setSnackbarOpen(false)}>
                <Alert severity={type}>
                    {message}
                </Alert>
            </Snackbar>
        </UIFeedbackContext.Provider>
    );
}

export default UIFeedbackProvider;