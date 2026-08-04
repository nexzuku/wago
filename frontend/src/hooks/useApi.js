import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

export const useApi = (apiFunction, options = {}) => {
  const {
    onSuccess,
    onError,
    showSuccessToast = false,
    showErrorToast = true,
    successMessage,
    errorMessage,
  } = options;

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFunction(...args);
      const result = response.data?.data || response.data;
      setData(result);

      if (showSuccessToast && successMessage) {
        toast.success(successMessage);
      }

      onSuccess?.(result);
      return { success: true, data: result };
    } catch (err) {
      const message = err.response?.data?.error?.message || 
                      err.response?.data?.message || 
                      errorMessage ||
                      'Something went wrong';
      setError(message);

      if (showErrorToast) {
        toast.error(message);
      }

      onError?.(err);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction, onSuccess, onError, showSuccessToast, showErrorToast, successMessage, errorMessage]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    isLoading,
    error,
    execute,
    reset,
    setData,
  };
};

export const usePaginatedApi = (apiFunction, options = {}) => {
  const { initialPage = 1, limit = 10, ...restOptions } = options;
  
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit,
    total: 0,
    totalPages: 0,
  });

  const { data, isLoading, error, execute: baseExecute, reset } = useApi(
    async (params = {}) => {
      const response = await apiFunction({
        page: pagination.page,
        limit: pagination.limit,
        ...params,
      });
      
      if (response.data?.meta) {
        setPagination(prev => ({
          ...prev,
          ...response.data.meta,
        }));
      }
      
      return response;
    },
    restOptions
  );

  const nextPage = useCallback(() => {
    if (pagination.page < pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  }, [pagination.page, pagination.totalPages]);

  const prevPage = useCallback(() => {
    if (pagination.page > 1) {
      setPagination(prev => ({ ...prev, page: prev.page - 1 }));
    }
  }, [pagination.page]);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page }));
    }
  }, [pagination.totalPages]);

  return {
    data,
    isLoading,
    error,
    execute: baseExecute,
    reset,
    pagination,
    nextPage,
    prevPage,
    goToPage,
  };
};

export default useApi;
