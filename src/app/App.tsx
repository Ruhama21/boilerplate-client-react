import { Layout } from 'common/components/Layout';
import { NotFoundView } from 'common/components/NotFoundView';
import { Role } from 'common/models';
import { BannerContentWrapper } from 'common/styles/utilities';
import { environment } from 'environment';
import { AgentRoutes } from 'features/agent-dashboard';
import { AuthRoutes, RequireAuth } from 'features/auth';
import { useAuth } from 'features/auth/hooks';
import { AppErrorBoundary } from 'features/error-boundary/components/AppErrorBoundary';
import { NotificationContext, NotificationsProvider } from 'features/notifications/context';
import { NotificationRoutes } from 'features/notifications/Routes';
import { UserRoutes } from 'features/user-dashboard';
import { UpdateUserProfilePage } from 'features/user-profile/pages/UpdateUserProfilePage';
import { createContext, FC, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Slide, toast, ToastContainer } from 'react-toastify';
import { ThemeProvider } from 'styled-components';
import { GlobalStyle } from '../GlobalStyle';
import light from 'themes/light';
import dark from 'themes/dark';
import { NetworkDetector } from 'features/network-detector/components/NetworkDetector';
import { ModalProvider } from 'react-modal-hook';
import { TransitionGroup } from 'react-transition-group';
import { notificationApi } from 'common/api/notificationApi';

export const ThemeContext = createContext({
  theme: 'light',
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  toggle: () => {},
});

export const App: FC = () => {
  const { user } = useAuth();
  const { unreadNotificationsContext, readNotificationsContext } = useContext(NotificationContext);
  const [theme, setTheme] = useState('light');

  const themeProviderValue = useMemo(() => {
    const toggle = () => {
      return theme === 'light' ? setTheme('dark') : setTheme('light');
    };

    return {
      theme,
      toggle,
    };
  }, [theme]);

  useEffect(() => {
    if (!user) {
      console.log('CLEAR');
      unreadNotificationsContext.clear();
      readNotificationsContext.clear();
      notificationApi.util.resetApiState();
    }
  }, [user, unreadNotificationsContext, readNotificationsContext]);

  return (
    <AppErrorBoundary>
      <ModalProvider rootComponent={TransitionGroup}>
      <NetworkDetector>
      <ThemeContext.Provider value={themeProviderValue}>
        <ThemeProvider theme={theme === 'light' ? light : dark}>
          <NotificationsProvider>
            <GlobalStyle />
            
            <ToastContainer
              autoClose={5000}
              closeButton
              closeOnClick
              newestOnTop
              hideProgressBar={false}
              position={toast.POSITION.TOP_RIGHT}
              role='alert'
              theme='light'
              limit={3}
              transition={Slide}
            />

                <BannerContentWrapper bannerShowing={environment.environment === 'staging'}>
                  <Routes>
                    <Route path='/auth/*' element={<AuthRoutes />} />
                    <Route
                      path='/user/profile/:id'
                      element={
                        <RequireAuth>
                          <Layout>
                            <UpdateUserProfilePage />
                          </Layout>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path='/agents/*'
                      element={
                        <RequireAuth>
                          <AgentRoutes />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path='/users/*'
                      element={
                        <RequireAuth allowedRoles={[Role.ADMIN]}>
                          <UserRoutes />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path='/notifications/*'
                      element={
                        <RequireAuth>
                          <NotificationRoutes />
                        </RequireAuth>
                      }
                    />

                    <Route path='/' element={<Navigate to='/agents' />} />
                    <Route path='*' element={<NotFoundView />} />
                  </Routes>
                </BannerContentWrapper>
              </NotificationsProvider>
            </ThemeProvider>
          </ThemeContext.Provider>
        </NetworkDetector>
      </ModalProvider>
    </AppErrorBoundary>
  );
};
