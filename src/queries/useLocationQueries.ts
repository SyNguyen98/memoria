import {AxiosHeaders} from "axios";
import {useMutation, useQuery} from "@tanstack/react-query";
import {appAxios} from "../api";
import {Location} from "../models/Location.ts";

const API_URL = '/api/locations';

export const useAllLocationsQuery = (collectionId: string, year: string) => {
    const params: Record<string, string> = {collectionId, year};
    if (!collectionId || collectionId === "all") delete params.collectionId;
    if (!year || year === "all") delete params.year;
    return useQuery({
        queryKey: ['getAllLocationsByParams', collectionId, year, params],
        queryFn: async (): Promise<Location[]> => {
            const res = await appAxios.get(`${API_URL}/all`, {params});
            return res.data;
        },
    })
}

export const usePagingLocationQuery = (collectionId?: string, page?: number, size?: number) => {
    return useQuery({
        queryKey: ['getPagingLocationsByParams', collectionId, page, size],
        queryFn: async (): Promise<{ header: AxiosHeaders, data: Location[] }> => {
            const res = await appAxios.get(API_URL, {
                params: {
                    collectionId, page, size,
                    sort: 'takenYear,desc,takenMonth,desc,takenDay,desc,takenTime,desc'
                }
            });
            return {
                header: res.headers as AxiosHeaders,
                data: res.data
            };
        },
        enabled: !!collectionId
    })
}

export const useLocationByIdQuery = (id?: string) => {
    return useQuery({
        queryKey: ['getLocationById', id],
        queryFn: async (): Promise<Location> => {
            const res = await appAxios.get(`${API_URL}/${id}`);
            return res.data;
        },
        enabled: !!id
    })
}

export const useCreateLocationMutation = () => {
    return useMutation({
        mutationKey: ['createLocation'],
        mutationFn: async (location: Location): Promise<Location> => {
            const res = await appAxios.post(API_URL, location);
            return res.data;
        }
    });
}

export const useUpdateLocationMutation = () => {
    return useMutation({
        mutationKey: ['updateLocation'],
        mutationFn: async (location: Location): Promise<Location> => {
            const res = await appAxios.put(`${API_URL}/${location.id}`, location);
            return res.data;
        },
    });
}

export const useDeleteLocationMutation = () => {
    return useMutation({
        mutationKey: ['deleteLocationById'],
        mutationFn: (id: string): Promise<void> => {
            return appAxios.delete(`${API_URL}/${id}`);
        },
    });
}