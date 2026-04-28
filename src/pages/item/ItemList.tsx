import "./ItemList.scss";
import {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router";
import {useTranslation} from "react-i18next";
import {Button, Grid, Typography} from "@mui/material";
import {KeyboardArrowLeft, PlayArrow} from "@mui/icons-material";
import {useItemQuery} from "@queries/useItemQueries.ts";
import {useLocationByIdQuery} from "@queries/useLocationQueries.ts";
import AppLoader from "../../components/app-loader/AppLoader.tsx";
import ItemViewDialog from "./item-view-dialog/ItemViewDialog";
import {isTabletOrPhone} from "@utils/ScreenUtil.ts";
import {useUIFeedback} from "@hooks/useUIFeedback.ts";

export default function ItemList() {
    const [choseIndex, setChoseIndex] = useState(-1);
    const [viewDialogOpened, setViewDialogOpened] = useState(false);

    const {locationId} = useParams();
    const navigate = useNavigate();

    const {t} = useTranslation();
    const {showSnackbar} = useUIFeedback();
    const itemQuery = useItemQuery(locationId, "medium");
    const locationQuery = useLocationByIdQuery(locationId);

    const items = useMemo(() => {
        if (itemQuery.data) {
            return [...itemQuery.data].sort((a, b) => new Date(a.takenDateTime).getTime() - new Date(b.takenDateTime).getTime());
        }
        return [];
    }, [itemQuery.data]);

    useEffect(() => {
        if (locationQuery.data) {
            document.title = `MEMORIA | ${locationQuery.data.place}`;
        }
    }, [locationQuery.data]);

    useEffect(() => {
        if (itemQuery.isError) {
            showSnackbar("error", t("item.cannot_load"));
        }
    }, [itemQuery.isError, showSnackbar, t]);

    const handleOpenViewDialog = (itemIndex: number) => {
        setChoseIndex(itemIndex);
        setViewDialogOpened(true);
    }

    const onCloseViewDialog = () => {
        setViewDialogOpened(false);
        setChoseIndex(-1);
    }

    return (
        <section className="item-container">
            <Button className="back-btn" variant="text" startIcon={<KeyboardArrowLeft/>}
                    onClick={() => navigate(-1)}>
                {t("button.back")}
            </Button>
            {isTabletOrPhone() &&
                <Typography variant="h6">
                    {locationQuery.data?.place}
                </Typography>
            }
            {/* Image/Video List */}
            {items.length > 0 ? (
                <Grid className="item-list" container spacing={1}>
                    {items.map((item, index) =>
                        <Grid key={item.id} size={{xs: 4, sm: 3, md: 3, lg: 2}}
                            // onContextMenu={(event) => handleRightClickImage(event)}
                              onClick={() => handleOpenViewDialog(index)}>
                            <img alt={item.name} src={item.thumbnailUrl}/>
                            {item.mimeType.includes("video") && (
                                <PlayArrow/>
                            )}
                        </Grid>
                    )}
                </Grid>
            ) : (
                itemQuery.isLoading ? <AppLoader/> : (
                    <Typography variant="body1" className="no-item-text">
                        {t("item.no_item")}
                    </Typography>
                )
            )}

            {/* Dialogs */}
            <ItemViewDialog open={viewDialogOpened} onClose={onCloseViewDialog} itemIndex={choseIndex} items={items}/>
        </section>
    )
}
