import "./CollectionDialog.scss";
import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useQueryClient} from "@tanstack/react-query";
import {
    useCreateCollectionMutation,
    useUpdateCollectionMutation,
    useUserEmailsCollectionQuery
} from "@queries/useCollectionQueries.ts";
import {
    Autocomplete,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from "@mui/material";
import {Collection} from "@models/Collection.ts";
import {isTabletOrPhone} from "@utils/ScreenUtil.ts";
import {useUIFeedback} from "@hooks/useUIFeedback.ts";

type Props = {
    open: boolean;
    onClose: () => void;
    collection: Collection | null;
}

type Input = {
    name: string;
    description: string;
    userEmails: string[];
}

type TagOption = {
    label: string;
    value: string;
}

export default function CollectionDialog(props: Readonly<Props>) {
    const [inputs, setInputs] = useState<Input>({name: '', description: '', userEmails: []});
    const [inputEmail, setInputEmail] = useState('');
    const [tags, setTags] = useState<string[]>([]);

    const {t} = useTranslation();
    const {showAppLoader, hideAppLoader, showSnackbar} = useUIFeedback();

    const queryClient = useQueryClient();
    const userEmailsCollectionQuery = useUserEmailsCollectionQuery();
    const createMutation = useCreateCollectionMutation();
    const updateMutation = useUpdateCollectionMutation();

    const TAG_OPTIONS: TagOption[] = [
        {
            label: t("tags.family"),
            value: "FAMILY"
        },
        {
            label: t("tags.friends"),
            value: "FRIENDS"
        },
        {
            label: t("tags.colleagues"),
            value: "COLLEAGUES"
        },
        {
            label: t("tags.lover"),
            value: "LOVER"
        }
    ]

    useEffect(() => {
        setTimeout(() => {
            if (props.collection) {
                setInputs({
                    name: props.collection.name,
                    description: props.collection.description,
                    userEmails: props.collection.userEmails
                });
                setTags(props.collection.tags || []);
            } else {
                setInputs({name: '', description: '', userEmails: []})
            }
        }, 0)
    }, [props.collection]);

    const onClose = (_event: object, reason: string) => {
        if (reason !== "backdropClick") {
            handleClose();
        }
    }

    const handleClose = () => {
        setInputs({name: '', description: '', userEmails: []});
        setInputEmail('');
        setTags([]);
        props.onClose();
    }

    const handleOnInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setInputs(state => ({...state, [event.target.name]: event.target.value}))
    }

    const handleOnChangeTags = (value: TagOption[]) => {
        setTags(value.map(option => option.value));
    };

    const onEnterEmail = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter') {
            const target = event.target as HTMLInputElement;
            const emails = inputs.userEmails ? [...inputs.userEmails] : [];
            emails.push(target.value);
            setInputs(state => ({...state, userEmails: emails}));
            setInputEmail('');
        }
    }

    const handleDeleteChip = (email: string) => {
        const emails = [...inputs.userEmails];
        const index = emails.indexOf(email);
        if (index > -1) {
            emails.splice(index, 1);
            setInputs(state => ({...state, userEmails: emails}));
        }
    }

    const handleSave = () => {
        const onSuccess = () => {
            hideAppLoader();
            showSnackbar("success", t("collection.save_success"));
            handleClose();
            queryClient.invalidateQueries({queryKey: ['getAllCollectionsHavingAccess']})
        }
        const onError = () => {
            hideAppLoader();
            showSnackbar("error", t("collection.save_error"));
        }

        showAppLoader();
        const collection: Collection = {
            name: inputs.name,
            description: inputs.description,
            tags,
            userEmails: inputs.userEmails
        }
        if (props.collection) {
            collection.id = props.collection.id;
            collection.ownerEmail = props.collection.ownerEmail;
            updateMutation.mutate(collection, {onSuccess, onError});
        } else {
            createMutation.mutate(collection, {onSuccess, onError});
        }
    }

    const handleCancel = () => {
        handleClose();
    }

    return (
        <Dialog className="collection-dialog" maxWidth={isTabletOrPhone() ? "xs" : "md"}
                open={props.open} onClose={onClose}>
            <DialogTitle>
                {props.collection ? t("collection.edit") : t("collection.add")}
            </DialogTitle>
            <DialogContent>
                {/* Name */}
                <TextField autoComplete="off" required fullWidth
                           name="name" label={t("collection.name")}
                           value={inputs.name}
                           onChange={handleOnInputChange}/>
                {/* Description */}
                <TextField autoComplete="off" fullWidth multiline maxRows={3}
                           name="description" label={t("collection.description")}
                           value={inputs.description}
                           onChange={handleOnInputChange}/>
                {/* Tags */}
                <Autocomplete multiple
                              options={TAG_OPTIONS.filter(option => !tags.includes(option.value))}
                              getOptionLabel={option => option.label}
                              value={TAG_OPTIONS.filter(option => tags.includes(option.value))}
                              onChange={(_event, value) => handleOnChangeTags(value)}
                              renderInput={(params) => (
                                  <TextField {...params} label={t("collection.tags")}/>
                              )}
                />
                {/* Emails */}
                <Autocomplete options={userEmailsCollectionQuery.data || []}
                              value={inputEmail}
                              onInputChange={(_event, value) => setInputEmail(value)}
                              onKeyDown={event => onEnterEmail(event)}
                              renderInput={(params) =>
                                  <TextField {...params}
                                             name="email"
                                             label={t("collection.shared_email")}
                                             placeholder={t("collection.email_placeholder")}/>}/>
                <Typography variant="body1">
                    {t("collection.email_description")}
                </Typography>
                <div className="email-list">
                    {inputs.userEmails.map(email =>
                        <Chip key={email} label={email} variant="outlined" onDelete={() => handleDeleteChip(email)}/>
                    )}
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" color="primary" onClick={handleSave}>
                    {t("button.save")}
                </Button>
                <Button variant="contained" color="inherit" onClick={handleCancel}>
                    {t("button.cancel")}
                </Button>
            </DialogActions>
        </Dialog>
    )
}
