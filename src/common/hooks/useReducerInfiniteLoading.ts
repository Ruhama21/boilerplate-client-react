import { ActionCreatorWithoutPayload } from '@reduxjs/toolkit';
import { PaginatedResult } from 'common/models';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useDispatch } from 'react-redux';
import { UseQuery, UseQueryOptions } from 'rtk-query-config';

export interface WithNumberIdentifier {
  id: number;
}

interface State<T> {
  items: T[];
  oldItems: T[];
  nextItemUrl: string | null;
  count: number;
  isGettingMore: boolean;
}

const initialState = {
  items: [] as any[],
  oldItems: [] as any[],
  nextItemUrl: null,
  count: 0,
  isGettingMore: false,
};

type Action<T> =
  | { type: 'add'; item: T }
  | { type: 'add-old'; items: T[]; count: number, isGettingMore?: boolean }
  | { type: 'set-next-item-url'; nextItemUrl: string | null }
  | { type: 'reset-get-more' }
  | { type: 'remove'; item: T }
  | { type: 'reset' };

const reducer = <T extends WithNumberIdentifier>(state: State<T>, action: Action<T>) => {
  switch (action.type) {
    case 'add':
      return { ...state, items: [action.item, ...state.items] };
    case 'add-old':
      return { ...state, oldItems: [...state.oldItems, ...action.items], count: action.count, isGettingMore: false };
    case 'remove': {
      const items = state.items.filter(i => i.id !== action.item.id);
      const oldItems = state.oldItems.filter(i => i.id !== action.item.id);
      let numRemoved = state.items.length - items.length;
      numRemoved += state.oldItems.length - oldItems.length;

      return {
        ...state,
        items,
        oldItems,
        count: state.count - numRemoved,
      };
    }
    case 'reset':
      return { ...initialState };
    case 'set-next-item-url':
      return { ...state, nextItemUrl: action.nextItemUrl, isGettingMore: true };
    default:
      return { ...initialState };
  }
};

export const useReducerInfiniteLoading = <T extends WithNumberIdentifier, ResultType extends PaginatedResult<T>>(
  initialUrl: string | null,
  useQuery: UseQuery<ResultType>,
  resetApiStateFunction: ActionCreatorWithoutPayload,
  options?: UseQueryOptions,
) => {
  const dispatch = useDispatch();

  const [{ items, oldItems, nextItemUrl, count, isGettingMore }, itemDispatch] = useReducer(reducer, {
    ...initialState,
    nextItemUrl: initialUrl,
  });
  const { data: fetchedItems, isFetching, isLoading, refetch } = useQuery(nextItemUrl, options);

  const add = useCallback((newItem: T) => {
    itemDispatch({ type: 'add', item: newItem});
  }, [itemDispatch]);

  const clear = useCallback(() => {
    itemDispatch({ type: 'reset' });
    dispatch(resetApiStateFunction());
  }, [itemDispatch, dispatch, resetApiStateFunction]);

  const remove = useCallback((itemToRemove: T) => {
      itemDispatch({ type: 'remove', item: itemToRemove });
    },
    [itemDispatch],
  );

  const hasMore = useMemo(() => {
    if (isLoading || isFetching) return false;
    return !!fetchedItems?.links.next;
  }, [fetchedItems, isLoading, isFetching]);

  const getMore = useCallback(() => {
    if (fetchedItems?.links.next && !isFetching) {
      itemDispatch({ type: 'set-next-item-url', nextItemUrl: fetchedItems.links.next });
    }
  }, [itemDispatch, isFetching, fetchedItems]);

  // Clear the items when the user's internet connection is restored
  useEffect(() => {
    if (!isLoading && isFetching && !isGettingMore) {
      clear();
    }
  }, [isLoading, isFetching, isGettingMore, clear]);

  // Append new items that we got from the API to
  // oldItems list
  useEffect(() => {

    itemDispatch({
      type: 'add-old',
      items: fetchedItems?.results || [],
      count: fetchedItems?.meta.count || 0,
    });

  }, [fetchedItems]);

  return {
    items: [...items, ...oldItems],
    count: items.length + count, // I'm not so sure this is right.
    hasMore,
    isFetching,
    isLoading,
    remove,
    clear,
    getMore,
    refetch,
    add
  };
};