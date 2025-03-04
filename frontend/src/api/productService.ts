import axiosInstance from '@/lib/axios';
import { SearchProductsParams, SearchProductsResponse } from '@/types/product';

export const productService = {
  searchProducts: async (
    params: SearchProductsParams
  ): Promise<SearchProductsResponse> => {
    // axiosInstance will handle your base URL and other configurations.
    const response = await axiosInstance.get<SearchProductsResponse>('/products/search', {
      params,
    });
    return response.data;
  }
};