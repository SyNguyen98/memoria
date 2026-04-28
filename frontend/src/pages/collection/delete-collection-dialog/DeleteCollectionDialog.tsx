import "./DeleteCollectionDialog.scss";
import {useTranslation} from "react-i18next";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useDeleteCollectionMutation} from "@queries/useCollectionQueries.ts";
import {Collection} from "@models/Collection.ts";
import {useUIFeedback} from "@hooks/useUIFeedback.ts";

type Props = {
    open: boolean;
    onClose: () => void;
    collection: Collection;
}

function DeleteCollectionDialog(props: Props) {
    const {t} = useTranslation();
    const {showSnackbar} = useUIFeedback();
    const queryClient = useQueryClient();

    const deleteMutation = useDeleteCollectionMutation();

    const onSuccess = () => {
        props.onClose();
        showSnackbar("success", t("collection.delete_success"));
        queryClient.invalidateQueries({queryKey: ['getAllCollectionsHavingAccess']})
    }
    const onError = () => {
        showSnackbar("error", t("collection.delete_error"));
    }

    const handleDeleteCollection = () => {
        deleteMutation.mutate(props.collection.id!, {onSuccess, onError});
    }

    return (
        <Dialog id="delete-collection-dialog" open={props.open} onClose={props.onClose}>
            <DialogTitle>
                {t("collection.delete")}
            </DialogTitle>
            <DialogContent>
                {t("collection.confirm_delete")} <b><i>{props.collection.name}</i></b>?
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="error" onClick={handleDeleteCollection}>
                    {t("button.delete")}
                </Button>
                <Button variant="contained" color="inherit" onClick={props.onClose}>
                    {t("button.cancel")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default DeleteCollectionDialog;