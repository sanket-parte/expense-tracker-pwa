import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { QUERY_KEYS } from './useQueries';

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newCategory) => api.post('/categories/', newCategory),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.delete(`/categories/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
        },
    });
};

export const useCreateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newExpense) => api.post('/expenses/', newExpense),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.expenses] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] });
        },
    });
};

export const useUpdateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => api.put(`/expenses/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.expenses] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] });
        },
    });
};

export const useDeleteExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.delete(`/expenses/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.expenses] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] });
        },
    });
};
