import { UpdateUserProfileFormData } from '../updateUserProfileForm/types';
import { useUpdateProfile } from 'core/modules/user/application/useUpdateProfile';
import { useAuth, useLogout } from 'features/auth/hooks';
import { FC } from 'react';
import Container from 'react-bootstrap/Container';
import { useHistory } from 'react-router-dom';
import { UpdateUserProfileForm } from '../updateUserProfileForm/index';
import { StyledFormWrapper } from 'features/styles/PageStyles';

export const UpdateUserProfilePage: FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { logout } = useLogout();
  const { updateProfile } = useUpdateProfile();

  const onSubmit = async (formData: UpdateUserProfileFormData) => {
    const data = { ...formData, profilePicture: '' };

    const onSuccess = () => {
      if (user && user.email !== formData.email) {
        logout();
      } else {
        history.goBack();
      }
    };

    updateProfile(data, onSuccess);
  };

  const onCancel = () => history.goBack();

  return (
    <Container className='d-flex justify-content-center'>
      <StyledFormWrapper>
        <UpdateUserProfileForm
          onSubmit={onSubmit}
          onCancel={onCancel}
          defaultValues={{
            firstName: user?.firstName ?? '',
            lastName: user?.lastName ?? '',
            email: user?.email ?? '',
          }}
        />
      </StyledFormWrapper>
    </Container>
  );
};
