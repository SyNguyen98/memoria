import {useLocation} from "react-router";
import {useTranslation} from "react-i18next";
import {AppBar, IconButton, InputAdornment, MenuItem, Select, Toolbar, Tooltip, Typography} from "@mui/material";
import {Language, Menu, MusicNote, MusicOff, Shuffle} from "@mui/icons-material";
import {SelectChangeEvent} from "@mui/material/Select";
import {PathName} from "@constants/Page.ts";
import {useAudio} from "@providers/AudioProvider.tsx";
import {useAppContext} from "@providers/AppProvider.tsx";
import {useSidebar} from "@hooks/useSidebar.ts";

export default function AppToolbar() {
    const {pathname} = useLocation();
    const {t} = useTranslation();
    const {isPlaying, playPause, nextTrack} = useAudio();

    const {currentLanguage, setCurrentLanguage} = useAppContext();
    const {setSidebarOpened} = useSidebar();

    const getTitle = () => {
        if (pathname.includes(PathName.MAP)) {
            return t("page.map");
        }
        if (pathname.includes(PathName.ITEM)) {
            return t("page.item");
        }
        if (pathname.includes(PathName.LOCATION)) {
            return t("page.location");
        }
        if (pathname.includes(PathName.COLLECTION)) {
            return t("page.collection");
        }
        if (pathname.includes(PathName.PROFILE)) {
            return t("page.profile");
        }
        return '';
    }

    const handleOpenMenu = () => {
        setSidebarOpened(true);
    }

    const handleChangeLanguage = (event: SelectChangeEvent) => {
        setCurrentLanguage(event.target.value);
    }

    return (
        <AppBar position="static">
            <Toolbar>
                <IconButton size="large" edge="start" color="inherit" onClick={handleOpenMenu}>
                    <Menu/>
                </IconButton>
                <Typography className="page-title" variant="h6" component="div"
                            sx={{flexGrow: 1, display: 'flex'}}>
                    {getTitle()}
                </Typography>
                <IconButton size="large" edge="start" color="inherit"
                            sx={{marginRight: '.25rem'}}
                            onClick={playPause}>
                    {isPlaying ? (
                        <Tooltip title={"Mute"}>
                            <MusicNote/>
                        </Tooltip>
                    ) : (
                        <Tooltip title={"Unmute"}>
                            <MusicOff/>
                        </Tooltip>
                    )}
                </IconButton>
                <IconButton size="large" edge="start" color="inherit"
                            sx={{marginRight: '.5rem'}}
                            onClick={nextTrack}>
                    <Tooltip title={"Shuffle"}>
                        <Shuffle/>
                    </Tooltip>
                </IconButton>
                <Select autoWidth
                        variant="standard"
                        value={currentLanguage}
                        onChange={handleChangeLanguage}
                        startAdornment={
                            <InputAdornment position="start" sx={{color: 'white'}}>
                                <Language/>
                            </InputAdornment>}
                        sx={{
                            color: 'white',
                            '& .MuiSelect-icon': {
                                color: 'white',
                            },
                            '&::before': {
                                borderBottom: 'none !important',
                            },
                        }}>
                    <MenuItem value="vn">
                        VI
                    </MenuItem>
                    <MenuItem value="en">
                        EN
                    </MenuItem>
                </Select>
            </Toolbar>
        </AppBar>
    )
}
