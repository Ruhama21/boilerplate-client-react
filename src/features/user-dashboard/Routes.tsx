import { Layout } from 'common/components/Layout';
import { NotFoundView } from 'common/components/NotFoundView';
import { NotificationPage } from 'features/notification/pages/NotificationPage';
import { FC } from 'react';
import { Route, Routes } from 'react-router-dom';
import { CreateUserView, UpdateUserView, UserListView } from './pages';

export const UserRoutes: FC = () => (
  <Layout>
    <Routes>
      <Route path='/' element={<UserListView />} />
      <Route path='/create-user' element={<CreateUserView />} />
      <Route path='/update-user/:id' element={<UpdateUserView />} />
      <Route path='/notifications' element={<NotificationPage />} />
      <Route path='*' element={<NotFoundView />} />
    </Routes>
  </Layout>
);
