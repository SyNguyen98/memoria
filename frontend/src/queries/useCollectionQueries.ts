import {AxiosHeaders} from "axios";
import {useMutation, useQuery} from "@tanstack/react-query";
import {appAxios} from "../api";
import {Collection} from "../models/Collection.ts";

const API_URL = '/api/collections';

export type CollectionApiParams = {
    page?: number;
    size?: number;
    sort?: string;
    unpaged?: boolean;
    tags?: string;
}

export const useCollectionQuery = (params: CollectionApiParams) => {
    const resolvedParams = {
        sort: 'lastModifiedDate,desc',
        ...params
    }
    return useQuery({
        queryKey: ['getAllCollectionsHavingAccess', params, resolvedParams],
        queryFn: async (): Promise<{ header: AxiosHeaders, data: Collection[] }> => {
            const res = await appAxios.get(API_URL, {params: resolvedParams});
            return {
                header: res.headers as AxiosHeaders,
                data: res.data
            };
        }
    })
}

export const useCollectionByIdQuery = (id?: string) => {
    return useQuery({
        queryKey: ['getCollectionById', id],
        queryFn: async (): Promise<Collection> => {
            const res = await appAxios.get(`${API_URL}/${id}`);
            return res.data;
        },
        enabled: !!id
    })
}

export const useUserEmailsCollectionQuery = () => {
    return useQuery({
        queryKey: ['getAllUserEmailsOfCollection'],
        queryFn: async (): Promise<string[]> => {
            const res = await appAxios.get(`${API_URL}/user-emails`);
            return res.data;
        }
    })
}

export const useYearsOfCollectionQuery = (collectionId?: string) => {
    return useQuery({
        queryKey: ['getAllYearsOfCollection', collectionId],
        queryFn: async (): Promise<number[]> => {
            const params: { collectionId?: string } = {};
            if (collectionId && collectionId !== 'all') {
                params.collectionId = collectionId;
            }
            const res = await appAxios.get(`${API_URL}/years`, {params});
            return res.data;
        }
    })
}

export const useCreateCollectionMutation = () => {
    return useMutation({
        mutationKey: ['createCollection'],
        mutationFn: async (collection: Collection): Promise<Collection> => {
            const res = await appAxios.post(API_URL, collection);
            return res.data;
        },
    });
}

export const useUpdateCollectionMutation = () => {
    return useMutation({
        mutationKey: ['updateCollection'],
        mutationFn: async (collection: Collection): Promise<Collection> => {
            const res = await appAxios.put(`${API_URL}/${collection.id}`, collection);
            return res.data;
        },
    });
}

export const useDeleteCollectionMutation = () => {
    return useMutation({
        mutationKey: ['deleteCollection'],
        mutationFn: (id: string): Promise<void> => {
            return appAxios.delete(`${API_URL}/${id}`);
        },
    });
}