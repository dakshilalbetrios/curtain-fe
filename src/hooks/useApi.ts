import { useState, useCallback } from 'react';
import { message } from 'antd';
import { ApiResponse } from '../services/api';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
    execute: (...args: any[]) => Promise<void>;
    reset: () => void;
}

export function useApi<T>(
    apiFunction: (...args: any[]) => Promise<ApiResponse<T>>,
    options?: {
        showSuccessMessage?: boolean;
        showErrorMessage?: boolean;
        onSuccess?: (data: T) => void;
        onError?: (error: string) => void;
    }
): UseApiReturn<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(
        async (...args: any[]) => {
            try {
                setState(prev => ({ ...prev, loading: true, error: null }));
                const response = await apiFunction(...args);

                if (!response.error) {
                    setState(prev => ({ ...prev, data: response.data, loading: false }));

                    if (options?.showSuccessMessage) {
                        message.success(response.message || 'Operation successful');
                    }

                    if (options?.onSuccess) {
                        options.onSuccess(response.data);
                    }
                } else {
                    const errorMessage = response.message || 'Operation failed';
                    setState(prev => ({ ...prev, error: errorMessage, loading: false }));

                    if (options?.showErrorMessage) {
                        message.error(errorMessage);
                    }

                    if (options?.onError) {
                        options.onError(errorMessage);
                    }
                }
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || 'An unexpected error occurred';
                setState(prev => ({ ...prev, error: errorMessage, loading: false }));

                if (options?.showErrorMessage) {
                    message.error(errorMessage);
                }

                if (options?.onError) {
                    options.onError(errorMessage);
                }
            }
        },
        [apiFunction, options]
    );

    const reset = useCallback(() => {
        setState({
            data: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
}
