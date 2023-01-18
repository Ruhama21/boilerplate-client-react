import { notificationApi } from 'common/api/notificationApi';
import { PaginatedResult } from 'common/models';
import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { useDispatch } from 'react-redux';
import { UseQuery, UseQueryOptions } from 'rtk-query-config';

interface WithStringIdentifier {
  id: string;
}

interface State<T extends WithStringIdentifier> {
  notifications: T[];
  oldNotifications: T[];
  nextNotificationUrl: string | null;
  count: number;
}

const initialState = {
  notifications: [],
  oldNotifications: [],
  nextNotificationUrl: null,
  count: 0,
};

type Action<T> =
  | { type: 'add'; notification: T }
  | { type: 'add-old'; notifications: T[]; count: number }
  | { type: 'set-next-notification-url'; nextNotificationUrl: string | null }
  | { type: 'remove'; notification: T }
  | { type: 'reset' };

const reducer = <T extends WithStringIdentifier>(state: State<T>, action: Action<T>) => {
  switch (action.type) {
    case 'add':
      return { ...state, notifications: [action.notification, ...state.notifications] };
    case 'add-old':
      return { ...state, oldNotifications: [...state.oldNotifications, ...action.notifications], count: action.count };
    case 'remove': {
      const notifications = state.notifications.filter(n => n.id !== action.notification.id);
      const oldNotifications = state.oldNotifications.filter(n => n.id !== action.notification.id);
      let numRemoved = state.notifications.length - notifications.length;
      numRemoved += state.oldNotifications.length - oldNotifications.length;

      return {
        ...state,
        notifications,
        oldNotifications,
        count: state.count - numRemoved,
      };
    }
    case 'reset':
      return { ...initialState };
    case 'set-next-notification-url':
      return { ...state, nextNotificationUrl: action.nextNotificationUrl };
    default:
      return { ...initialState };
  }
};

export const useReducerInfiniteLoading = <T extends WithStringIdentifier, ResultType extends PaginatedResult<T>>(
  initialUrl: string,
  useQuery: UseQuery<ResultType>,
  options?: UseQueryOptions,
) => {
  const dispatch = useDispatch();

  const [{ notifications, oldNotifications, nextNotificationUrl, count }, notificationDispatch] = useReducer(reducer, {
    ...initialState,
    nextNotificationUrl: initialUrl,
  });
  const { data: unreadNotifications, isFetching, isLoading, refetch } = useQuery(nextNotificationUrl, options);

  // Append new notifications that we got from the API to
  // oldNotifications list
  useEffect(() => {
    notificationDispatch({
      type: 'add-old',
      notifications: unreadNotifications?.results || [],
      count: unreadNotifications?.meta.count || 0,
    });
  }, [unreadNotifications]);

  const clear = useCallback(() => {
    notificationDispatch({ type: 'reset' });
    dispatch(notificationApi.util.resetApiState());
  }, [notificationDispatch, dispatch]);

  const remove = useCallback(
    (notification: T) => {
      notificationDispatch({ type: 'remove', notification });
    },
    [notificationDispatch],
  );

  const getMore = useCallback(() => {
    if (unreadNotifications?.links.next && !isFetching) {
      notificationDispatch({ type: 'set-next-notification-url', nextNotificationUrl: unreadNotifications.links.next });
    }
  }, [notificationDispatch, isFetching, unreadNotifications]);

  const notificationProviderValue = useMemo(() => {
    const result = {
      notifications: [...notifications, ...oldNotifications],
      count: notifications.length + count, // I'm not so sure this is right.
      hasMore: !!unreadNotifications?.links.next,
      isFetching,
      isLoading,
      remove,
      clear,
      getMore,
    };
    return result;
  }, [clear, remove, getMore, notifications, unreadNotifications, count, oldNotifications, isFetching, isLoading]);

  return notificationProviderValue;
};
