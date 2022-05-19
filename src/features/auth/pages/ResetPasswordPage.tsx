import { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { handleApiError, isFetchBaseQueryError } from 'common/api/handleApiError';
import * as notificationService from 'common/services/notification';
import { useResetPasswordMutation } from 'common/api/userApi';
import { FormData, ResetPasswordForm } from '../components/ResetPasswordForm';
import { PageWrapper } from 'common/styles/page';
import { StyledFormWrapper, Title } from 'common/styles/form';
import { isErrorResponse } from 'common/error/utilities';
import { ServerValidationErrors } from 'common/models';

export const ResetPasswordPage: FC = () => {
  const navigate = useNavigate();
  const { token = '', uid = '' } = useParams<{ token: string; uid: string }>();
  const [resetPassword] = useResetPasswordMutation();
  const [submissionError, setSubmissionError] = useState<ServerValidationErrors<FormData> | null>(null);

  const onSubmit = async (formData: FormData) => {
    const data = { newPassword: formData.newPassword, token, uid };

    try {
      await resetPassword(data).unwrap();
      notificationService.showSuccessMessage('The password was reset successfully. Please log in.');
      navigate('/auth/login');
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        if (isErrorResponse<FormData>(error?.data)) {
          setSubmissionError((error?.data).error);
        } else handleApiError(error);
      } else {
        throw error;
      }
    }
  };

  return (
    <PageWrapper>
      <StyledFormWrapper>
        <Title>Reset Password</Title>
        <ResetPasswordForm onSubmit={onSubmit} serverValidationErrors={submissionError} />
      </StyledFormWrapper>
    </PageWrapper>
  );
};
