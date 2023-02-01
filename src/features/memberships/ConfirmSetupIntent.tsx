import { useConfirmSetupIntentQuery } from 'common/api/paymentsApi';
import { LoadingSpinner } from 'common/components/LoadingSpinner';
import { showErrorMessage, showSuccessMessage } from 'common/services/notification';
import { SmallContainer } from 'common/styles/page';
import { useAuth } from 'features/auth/hooks';
import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';

export const ConfirmSetupIntent = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [pollingInterval] = useState(5000);
  const { data } = useConfirmSetupIntentQuery(id!, {
    pollingInterval,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      if (data.status === 'succeeded') {
        navigate(`/user/profile/${user!.id}?tab=subscription`, { replace: true });
        showSuccessMessage('Payment method added successfully.');
      }

      if (data.status === 'canceled') {
        navigate(`/user/profile/${user!.id}?tab=subscription`, { replace: true });
        showErrorMessage('Something went wrong, please try again later.');
      }
    }
  }, [data, navigate, user]);

  return (
    <SmallContainer>
      <Card>
        <Card.Body className='d-flex flex-column align-items-center justify-content-center'>
          <p className='lead'>Confirming your card information... Do not navigate away from this page.</p>
          <LoadingSpinner />
        </Card.Body>
      </Card>
    </SmallContainer>
  );
};
