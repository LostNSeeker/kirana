// hooks/useApi.ts
import { useState } from 'react';
import { AxiosRequestConfig } from 'axios';
import * as api from '../services/api';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useApi<T>(initialData: T | null = null) {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const get = async (url: string, config?: AxiosRequestConfig) => {
    setState({ data: state.data, loading: true, error: null });
    try {
      const data = await api.fetchData<T>(url, config);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  };

  const post = async (url: string, payload: any, config?: AxiosRequestConfig) => {
    setState({ data: state.data, loading: true, error: null });
    try {
      const data = await api.postData<T>(url, payload, config);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  };

  const put = async (url: string, payload: any, config?: AxiosRequestConfig) => {
    setState({ data: state.data, loading: true, error: null });
    try {
      const data = await api.putData<T>(url, payload, config);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  };

  const del = async (url: string, config?: AxiosRequestConfig) => {
    setState({ data: state.data, loading: true, error: null });
    try {
      const data = await api.deleteData<T>(url, config);
      setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
      throw error;
    }
  };

  return {
    ...state,
    get,
    post,
    put,
    delete: del,
    reset: () => setState({ data: initialData, loading: false, error: null }),
  };
}
