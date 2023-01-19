import { ActionCreatorWithoutPayload } from '@reduxjs/toolkit';
import { PaginatedResult } from 'common/models';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
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
}

const initialState = {
  items: [] as any[],
  oldItems: [] as any[],
  nextItemUrl: null,
  count: 0,
};

type Action<T> =
  | { type: 'add'; item: T }
  | { type: 'add-old'; items: T[]; count: number }
  | { type: 'set-next-item-url'; nextItemUrl: string | null }
  | { type: 'remove'; item: T }
  | { type: 'reset' };

const reducer = <T extends WithNumberIdentifier>(state: State<T>, action: Action<T>) => {
  switch (action.type) {
    case 'add':
      return { ...state, items: [action.item, ...state.items] };
    case 'add-old':
      return { ...state, oldItems: [...state.oldItems, ...action.items], count: action.count };
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
      return { ...state, nextItemUrl: action.nextItemUrl };
    default:
      return { ...initialState };
  }
};

const usePrevious = <T>(value: T | null) => {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    ref.current = value;
  },[value]);
  return ref.current;
}

export const useReducerInfiniteLoading = <T extends WithNumberIdentifier, ResultType extends PaginatedResult<T>>(
  initialUrl: string | null,
  useQuery: UseQuery<ResultType>,
  resetApiStateFunction: ActionCreatorWithoutPayload,
  options?: UseQueryOptions,
) => {
  const dispatch = useDispatch();
  const rerenderingType = useRef<string | null>('clear');

  const [{ items, oldItems, nextItemUrl, count }, itemDispatch] = useReducer(reducer, {
    ...initialState,
    nextItemUrl: initialUrl,
  });
  const { data: fetchedItems, isFetching, isLoading, refetch } = useQuery(nextItemUrl, options);

  const previousNextUrl = usePrevious<string | null | undefined>(fetchedItems?.links.next);

  const add = useCallback((newItem: T) => {
    itemDispatch({ type: 'add', item: newItem});
  }, [itemDispatch]);

  const clear = useCallback(() => {
    rerenderingType.current = null;
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
      rerenderingType.current = 'getMore';
      itemDispatch({ type: 'set-next-item-url', nextItemUrl: fetchedItems.links.next });
    }
  }, [itemDispatch, isFetching, fetchedItems]);

  console.log('rerenderingType.current:', rerenderingType.current);

  useEffect(() => {

    console.log('isLoading:', isLoading);
    console.log('isFetching:', isFetching);
    console.log('previousNextUrl:', previousNextUrl);
    console.log('nextItemUrl:', fetchedItems?.links.next);

    // Clear the items if the user's connection has been restored
    if (rerenderingType.current !== 'getMore' && !isLoading && isFetching && previousNextUrl !== undefined && previousNextUrl === fetchedItems?.links.next) {
      clear();
      console.log('reconnection - clear');
    }
  }, [clear, isLoading, isFetching, previousNextUrl, fetchedItems]);

  // Append new items that we got from the API to
  // oldItems list
  useEffect(() => {
    
    itemDispatch({
      type: 'add-old',
      items: fetchedItems?.results || [],
      count: fetchedItems?.meta.count || 0,
    });

    console.log('fetchedItems:', fetchedItems?.results || []);

    return () => {
      if (rerenderingType.current === 'clear') {
        clear();
      }
    };
  }, [fetchedItems, clear]);

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
