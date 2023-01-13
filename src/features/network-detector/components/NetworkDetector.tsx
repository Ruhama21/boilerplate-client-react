import { FC, PropsWithChildren } from 'react';
import * as notificationService from 'common/services/notification';
import styled from 'styled-components';
import { getRandomNumber, useNetworkDetection } from '../hooks/useNetworkConnection';

const InteractionBarrier = styled.div`
  width: 100vw;
  height: 100vh;
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1090;
`;

export const NetworkDetector: FC<PropsWithChildren<unknown>> = ({ children }) => {
  const { isDisconnected } = useNetworkDetection();

  return (
    <>
      {isDisconnected && (
        <InteractionBarrier
          onClick={() =>
            notificationService.showErrorMessage(
              'You must resolve your internet connectivity issues before you can interact with this app.',
              getRandomNumber(),
            )
          }
        />
      )}
      {children}
    </>
  );
};
