import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from 'features/auth/hooks';
import { handleApiError, isFetchBaseQueryError } from 'common/api/handleApiError';
import {
  ChangePasswordRequest,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResendChangeEmailVerificationEmailMutation,
} from 'common/api/userApi';
import { PageHeader } from 'common/styles/page';
import { ServerValidationErrors } from 'common/models';
import * as notificationService from 'common/services/notification';
import {
  ChangePasswordForm,
  FormData as ForgotPasswordFormData,
} from 'features/user-dashboard/components/ChangePasswordForm';
import {
  useCancelChangeEmailRequest,
  useChangeEmailRequest,
  useDeleteProfilePicture,
  useUpdateProfilePicture,
  useUpdateUserProfile,
} from 'features/user-profile/hooks';
import { FC, useRef, useState } from 'react';
import { Alert, Card, Col, Container, Modal, Nav, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { UpdateUserEmailForm, UserEmailFormData } from '../components/UpdateUserEmailForm';
import { UserProfilePicture } from 'features/navbar/components/UserProfilePicture';
import { isObject } from 'common/error/utilities';
import { ProfileFormData, UpdateUserProfileForm } from '../components/UpdateUserProfileForm';
import { Trans } from 'react-i18next';
import { LoadingButton } from 'common/components/LoadingButton';
import { Constants } from 'utils/constants';
import { faContactCard, faUnlockKeyhole } from '@fortawesome/free-solid-svg-icons';
import { useModal } from 'react-modal-hook';

type RouteParams = {
  id: string;
};

const ProfileNav = styled(Nav).attrs({ className: 'flex-column' })`
  margin-bottom: 1rem;
  margin-right: 1rem;

  a {
    margin-bottom: 0.5rem;
    color: ${props => props.theme.textColor};
    padding: 0.5rem 1rem;
    border-radius: ${props => props.theme.borderRadius};

    &.active {
      font-weight: 600;
      background: ${props => props.theme.nav.link.activeBackground};
      color: ${props => props.theme.nav.link.activeText};
    }
  }
`;

export const UserProfilePage: FC = () => {
  const { id = '' } = useParams<RouteParams>();
  const { user } = useAuth();
  const inputFile = useRef<HTMLInputElement>(null!);
  const [resendChangeEmailVerificationEmail, { isLoading: isResendingChangeEmail }] =
    useResendChangeEmailVerificationEmailMutation();
  const { cancelChangeEmailRequest, isLoading: isCancelingChangeEmail } = useCancelChangeEmailRequest();
  const [forgotPassword, { isLoading: isLoadingForgotPassword }] = useForgotPasswordMutation();
  const { updateUserProfile } = useUpdateUserProfile();
  const { changeEmailRequest } = useChangeEmailRequest();
  const { updateUserProfilePicture, isLoading: isLoadingUpdateProfilePicture } = useUpdateProfilePicture();
  const { deleteUserProfilePicture, isLoading: isLoadingDeleteProfilePicture } = useDeleteProfilePicture();
  const [changePassword] = useChangePasswordMutation();
  const [tab, setTab] = useState('profile');
  const [passwordFormValidationErrors, setPasswordFormValidationErrors] =
    useState<ServerValidationErrors<ForgotPasswordFormData> | null>(null);

  const onSubmit = async (formData: ProfileFormData) => {
    const data = { id, ...formData };

    await updateUserProfile(data);
  };

  const handleResendChangeEmailVerificationEmail = async () => {
    try {
      await resendChangeEmailVerificationEmail({ id });
      notificationService.showSuccessMessage('Change Email verification email has been sent.');
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        handleApiError(error);
      } else {
        notificationService.showErrorMessage('Unable to Send Change Email verification email');
        throw error;
      }
    }
  };

  const handleDeleteProfilePicture = async () => {
    const data = { id };
    await deleteUserProfilePicture(data);
  };

  const profilePictureIsDefined = () => {
    if (user) {
      return !!user.profilePicture;
    }
    return false;
  };

  const onChangePasswordFormSubmit = async (data: ForgotPasswordFormData) => {
    const request: ChangePasswordRequest = { id: user!.id, ...data };

    try {
      await changePassword(request).unwrap();
      notificationService.showSuccessMessage('Password updated.');
    } catch (error) {
      if (error && isFetchBaseQueryError(error)) {
        if (isObject(error.data)) {
          setPasswordFormValidationErrors(error.data);
        }
      } else {
        throw error;
      }
    }
  };

  const resetPassword = async () => {
    await forgotPassword({ email: user!.email });
    notificationService.showSuccessMessage('Instructions on how to reset your password have been sent to your email.');
  };

  const onProfileImageChange = async (e: React.BaseSyntheticEvent) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    await updateUserProfilePicture({ id: user!.id, profilePicture: formData });
  };

  const [emailFormValidationErrors, setEmailFormValidationErrors] =
    useState<ServerValidationErrors<UserEmailFormData> | null>(null);
  const [showModal, hideModal] = useModal(({ in: open, onExited }) => {
    const onSubmitRequestEmailChange = async (formData: UserEmailFormData) => {
      const data = { id, ...formData };
      try {
        await changeEmailRequest(data);
        hideModal();
      } catch (error) {
        if (error && isFetchBaseQueryError(error)) {
          if (isObject(error.data)) {
            setEmailFormValidationErrors(error.data);
          }
        } else {
          throw error;
        }
      }
    };

    return (
      <Modal
        show={open}
        onHide={() => {
          hideModal();
        }}
        onExited={onExited}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change my Email</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Changing your email will change your login email, as well as where emails are sent when you need to be
            notified.
          </p>
          <UpdateUserEmailForm
            onSubmit={onSubmitRequestEmailChange}
            serverValidationErrors={emailFormValidationErrors}
          />
        </Modal.Body>
      </Modal>
    );
  });

  return (
    <Container>
      <PageHeader className='mb-4'>
        <div className='d-flex'>
          <div>
            <h1>
              <Trans i18nKey='userProfile.heading'>Account Settings</Trans>
            </h1>
            <p className='text-muted'>
              <Trans i18nKey='userProfile.subheading'>Update your account and profile settings here.</Trans>
            </p>
          </div>
        </div>
      </PageHeader>

      <Row>
        <Col md={3}>
          <ProfileNav defaultActiveKey='/home'>
            <ProfileNav.Link onClick={() => setTab('profile')} className={tab === 'profile' ? 'active' : ''}>
              <FontAwesomeIcon className='me-2' icon={faContactCard} />
              <Trans i18nKey='userProfile.profile'>Profile</Trans>
            </ProfileNav.Link>
            <ProfileNav.Link onClick={() => setTab('security')} className={tab === 'security' ? 'active' : ''}>
              <FontAwesomeIcon className='me-2' icon={faUnlockKeyhole} />
              <Trans i18nKey='userProfile.security'>Security and Password</Trans>
            </ProfileNav.Link>
          </ProfileNav>
        </Col>

        <Col>
          {tab === 'profile' ? (
            <>
              <Row>
                <Col md={8}>
                  <Card className='mb-4'>
                    <Card.Body>
                      <h5>
                        <Trans i18nKey='userProfile.generalHeading'>General Information</Trans>
                      </h5>
                      <p className='text-muted'>This information will be used to identify you in our system</p>
                      <UpdateUserProfileForm
                        onSubmit={onSubmit}
                        defaultValues={{
                          firstName: user?.firstName ?? '',
                          lastName: user?.lastName ?? '',
                        }}
                      />
                    </Card.Body>
                  </Card>

                  <Card className='mb-4'>
                    <Card.Body>
                      <h5>
                        <Trans i18nKey='userProfile.email'>Change Email Address</Trans>
                      </h5>

                      {user!.newEmail ? (
                        <Alert variant='warning'>
                          <div>
                            <p data-testid='updateUserExistingEmailChangeInfoContent'>
                              <Trans i18nKey='userProfile.changeEmailDescription'>
                                You requested an email change. A verification email has been sent to{' '}
                                <strong>
                                  <>{{ email: user!.newEmail }}</>
                                </strong>
                                . To confirm your new email, please follow the directions in the verification email.
                              </Trans>
                            </p>
                            <LoadingButton
                              loading={isResendingChangeEmail}
                              variant='warning'
                              data-testid='resendVerificationEmailButton'
                              onClick={handleResendChangeEmailVerificationEmail}
                            >
                              <Trans i18nKey='userProfile.resendEmail'>Resend Verification Email</Trans>
                            </LoadingButton>
                            <LoadingButton
                              onClick={() => cancelChangeEmailRequest()}
                              loading={isCancelingChangeEmail}
                              className='ms-2'
                              variant='default'
                            >
                              Cancel Request
                            </LoadingButton>
                          </div>
                        </Alert>
                      ) : (
                        <>
                          <p className='text-muted'>
                            <Trans i18nKey='userProfile.emailDescription'>
                              Your email address on file will be used to communicate with you. Your current email on
                              file is <b>{user!.email}</b>. Changing your email requires you to confirm your new email
                              address.
                            </Trans>
                          </p>

                          <Button onClick={() => showModal()} variant='default'>
                            Change my Email
                          </Button>
                        </>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card>
                    <Card.Body>
                      <h5>
                        <Trans i18nKey='userProfile.photo'>Profile Photo</Trans>
                      </h5>
                      <p className='text-muted'>
                        <Trans i18nKey='userProfile.photoDescription'>
                          This is the photo of you that other users in the system will be able to see.
                        </Trans>
                      </p>

                      <div className='d-flex align-items-center justify-content-center flex-column'>
                        <div className='mt-3'>
                          <UserProfilePicture user={user} size='md' radius={128} />
                        </div>

                        <div className='w-100 d-grid gap-2'>
                          <LoadingButton
                            loading={isLoadingUpdateProfilePicture}
                            onClick={() => inputFile.current.click()}
                            variant='default'
                            className='mt-3'
                          >
                            Select File...
                          </LoadingButton>

                          <input
                            hidden
                            ref={inputFile}
                            type='file'
                            accept={Constants.SUPPORTED_PROFILE_PICTURE_FORMATS.join(',')}
                            onChange={e => onProfileImageChange(e)}
                          />

                          <LoadingButton
                            variant='danger'
                            loading={isLoadingDeleteProfilePicture}
                            disabled={!profilePictureIsDefined()}
                            onClick={handleDeleteProfilePicture}
                          >
                            <Trans i18nKey='delete'>Delete</Trans>
                          </LoadingButton>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          ) : (
            ''
          )}

          {tab === 'security' ? (
            <Row>
              <Col md={8}>
                <Card>
                  <Card.Body>
                    <h5>
                      <Trans i18nKey='userProfile.changePassword'>Change my Password</Trans>
                    </h5>
                    <p className='text-muted'>
                      <Trans i18nKey='userProfile.changePasswordDescription'>
                        Change your password by entering your current password, as well as your new password.
                      </Trans>
                    </p>
                    <ChangePasswordForm
                      onSubmit={onChangePasswordFormSubmit}
                      serverValidationErrors={passwordFormValidationErrors}
                    />
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card>
                  <Card.Body>
                    <h5>Forgot your password?</h5>
                    <p className='text-muted'>
                      Click the button below to be sent instructions on how to reset your password.
                    </p>
                    <LoadingButton loading={isLoadingForgotPassword} onClick={() => resetPassword()} variant='default'>
                      Reset my Password
                    </LoadingButton>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : (
            ''
          )}
        </Col>
      </Row>
    </Container>
  );
};