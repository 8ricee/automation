'use client';

import { useState, useEffect } from 'react';
import { quoteApi, Quote, QuoteInsert, QuoteUpdate } from '../api/quoteApi';

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quoteApi.getAll();
      setQuotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải danh sách báo giá');
    } finally {
      setLoading(false);
    }
  };

  const createQuote = async (quoteData: QuoteInsert) => {
    try {
      const newQuote = await quoteApi.create(quoteData);
      setQuotes(prev => [newQuote, ...prev]);
      return newQuote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tạo báo giá');
      throw err;
    }
  };

  const updateQuote = async (id: string, updates: QuoteUpdate) => {
    try {
      const updatedQuote = await quoteApi.update(id, updates);
      setQuotes(prev => prev.map(quote => 
        quote.id === id ? updatedQuote : quote)
      );
      return updatedQuote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật báo giá');
      throw err;
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      await quoteApi.delete(id);
      setQuotes(prev => prev.filter(quote => quote.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi xóa báo giá');
      throw err;
    }
  };

  const updateQuoteStatus = async (id: string, status: Quote['status']) => {
    try {
      const updatedQuote = await quoteApi.updateStatus(id, status);
      setQuotes(prev => prev.map(quote => 
        quote.id === id ? updatedQuote : quote)
      );
      return updatedQuote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái báo giá');
      throw err;
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return {
    quotes,
    loading,
    error,
    refetch: fetchQuotes,
    create: createQuote,
    update: updateQuote,
    delete: deleteQuote,
    updateStatus: updateQuoteStatus
  };
};

export const useQuoteFilters = () => {
  const [status, setStatus] = useState<string | null>(null);
  const [customerFilter, setCustomerFilter] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState<string | null>(null);
  const [dateTo, setDateTo] = useState<string | null>(null);
  const [expiredOnly, setExpiredOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const clearFilters = () => {
    setStatus(null);
    setCustomerFilter(null);
    setDateFrom(null);
    setDateTo(null);
    setExpiredOnly(false);
    setSearchQuery('');
  };

  const getFilteredQuotes = async (quotes: Quote[]) => {
    let filtered = [...quotes];

    // Apply status filter
    if (status) {
      filtered = filtered.filter(quote => quote.status === status);
    }

    // Apply customer filter
    if (customerFilter) {
      filtered = filtered.filter(quote => quote.customer_id === customerFilter);
    }

    // Apply date filters
    if (dateFrom) {
      filtered = filtered.filter(quote => quote.issue_date >= dateFrom);
    }
    if (dateTo) {
      filtered = filtered.filter(quote => quote.issue_date <= dateTo);
    }

    // Apply expired filter
    if (expiredOnly) {
      const today = new Date().toISOString().split('T')[0];
      filtered = filtered.filter(quote => 
        quote.expiry_date && quote.expiry_date < today
      );
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(quote => 
        quote.quote_number.toLowerCase().includes(query) ||
        quote.customers?.name.toLowerCase().includes(query) ||
        (quote.notes && quote.notes.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  return {
    filters: {
      status,
      customerFilter,
      dateFrom,
      dateTo,
      expiredOnly,
      searchQuery
    },
    setFilters: {
      setStatus,
      setCustomerFilter,
      setDateFrom,
      setDateTo,
      setExpiredOnly,
      setSearchQuery
    },
    clearFilters,
    getFilteredQuotes
  };
};

export const useQuoteStatistics = () => {
  const [statistics, setStatistics] = useState({
    total_quotes: 0,
    total_value: 0,
    draft_quotes: 0,
    sent_quotes: 0,
    accepted_quotes: 0,
    rejected_quotes: 0,
    expired_quotes: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await quoteApi.getStatistics();
      setStatistics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải thống kê báo giá');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics
  };
};
