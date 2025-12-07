import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { QUERY_KEYS } from './useQueries';

export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newCategory) => api.post('/categories/', newCategory),
        onMutate: async (newCategory) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.categories] });
            const previousCategories = queryClient.getQueryData([QUERY_KEYS.categories]);
            queryClient.setQueryData([QUERY_KEYS.categories], (old) => [...(old || []), { ...newCategory, id: Date.now() }]); // Temp ID
            return { previousCategories };
        },
        onError: (err, newCategory, context) => {
            queryClient.setQueryData([QUERY_KEYS.categories], context.previousCategories);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.delete(`/categories/${id}`),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.categories] });
            const previousCategories = queryClient.getQueryData([QUERY_KEYS.categories]);
            queryClient.setQueryData([QUERY_KEYS.categories], (old) => old?.filter(c => c.id !== id));
            return { previousCategories };
        },
        onError: (err, id, context) => {
            queryClient.setQueryData([QUERY_KEYS.categories], context.previousCategories);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.categories] });
        },
    });
};

export const useCreateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newExpense) => api.post('/expenses/', newExpense),
        onMutate: async (newExpense) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.expenses] });
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.dashboard] });

            const previousExpenses = queryClient.getQueriesData({ queryKey: [QUERY_KEYS.expenses] });

            // Optimistically update Infinite Query
            queryClient.setQueriesData({ queryKey: [QUERY_KEYS.expenses] }, (old) => {
                if (!old) return old;

                // Handle Infinite Query (pages)
                if (old.pages) {
                    const newPages = [...old.pages];
                    if (newPages.length > 0) {
                        newPages[0] = [
                            { ...newExpense, id: Date.now(), created_at: new Date().toISOString() }, // Temp ID & date
                            ...newPages[0]
                        ];
                    }
                    return { ...old, pages: newPages };
                }

                // Handle Standard Query (Array e.g. Recent Expenses)
                if (Array.isArray(old)) {
                    return [
                        { ...newExpense, id: Date.now(), created_at: new Date().toISOString() },
                        ...old
                    ];
                }

                return old;
            });

            return { previousExpenses };
        },
        onError: (err, newExpense, context) => {
            // Restore all modified queries
            if (context?.previousExpenses) {
                context.previousExpenses.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.expenses] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] });
        },
    });
};

export const useUpdateExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }) => api.put(`/expenses/${id}`, data),
        onMutate: async ({ id, data }) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.expenses] });
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.dashboard] });

            const previousExpenses = queryClient.getQueriesData({ queryKey: [QUERY_KEYS.expenses] });

            queryClient.setQueriesData({ queryKey: [QUERY_KEYS.expenses] }, (old) => {
                if (!old) return old;

                // Handle Infinite Query
                if (old.pages) {
                    return {
                        ...old,
                        pages: old.pages.map(page =>
                            page.map(expense => expense.id === id ? { ...expense, ...data } : expense)
                        )
                    };
                }

                // Handle Standard Query
                if (Array.isArray(old)) {
                    return old.map(expense => expense.id === id ? { ...expense, ...data } : expense);
                }

                return old;
            });

            return { previousExpenses };
        },
        onError: (err, variables, context) => {
            if (context?.previousExpenses) {
                context.previousExpenses.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.expenses] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] });
        },
    });
};

export const useDeleteExpense = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => api.delete(`/expenses/${id}`),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.expenses] });
            await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.dashboard] });

            const previousExpenses = queryClient.getQueriesData({ queryKey: [QUERY_KEYS.expenses] });

            queryClient.setQueriesData({ queryKey: [QUERY_KEYS.expenses] }, (old) => {
                if (!old) return old;

                // Handle Infinite Query
                if (old.pages) {
                    return {
                        ...old,
                        pages: old.pages.map(page => page.filter(expense => expense.id !== id))
                    };
                }

                // Handle Standard Query
                if (Array.isArray(old)) {
                    return old.filter(expense => expense.id !== id);
                }

                return old;
            });

            return { previousExpenses };
        },
        onError: (err, id, context) => {
            if (context?.previousExpenses) {
                context.previousExpenses.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.expenses] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.dashboard] });
        },
    });
};
