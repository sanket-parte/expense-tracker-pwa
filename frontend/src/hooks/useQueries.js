import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import api from '../lib/api';

// Keys
export const QUERY_KEYS = {
    user: 'user',
    categories: 'categories',
    dashboard: 'dashboard',
    expenses: 'expenses',
};

// Fetchers
const fetchCategories = async () => {
    const { data } = await api.get('/categories/');
    return data;
};

const fetchDashboardStats = async () => {
    const { data } = await api.get('/analytics/dashboard');
    return data;
};

const fetchExpenses = async ({ pageParam = 0, queryKey }) => {
    const [_, filters] = queryKey;
    const params = new URLSearchParams();

    // Add filters
    Object.entries(filters || {}).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });

    params.append('offset', pageParam);
    params.append('limit', 20);

    const { data } = await api.get(`/expenses/?${params.toString()}`);
    return data;
};

// Hooks
export const useCategories = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.categories],
        queryFn: fetchCategories,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

export const useDashboardStats = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.dashboard],
        queryFn: fetchDashboardStats,
        staleTime: 1000 * 60 * 1, // 1 minute
    });
};

export const useExpenses = (filters) => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.expenses, filters],
        queryFn: fetchExpenses,
        getNextPageParam: (lastPage, allPages) => {
            return lastPage.length === 20 ? allPages.length * 20 : undefined;
        },
        keepPreviousData: true,
    });
};
