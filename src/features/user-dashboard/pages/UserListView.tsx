/* eslint-disable no-console */
import { CustomRenderer, GenericTable, TableHeader } from 'common/components';
import ActionButton, { ActionButtonProps } from 'common/components/ActionButton';
import { useConfirmationModal } from 'common/hooks';
import { User } from 'common/models';
import {
  useDeleteUserMutation,
  useForgotPasswordMutation,
  useGetUsersQuery,
  useResendActivationEmailMutation,
} from 'features/user-dashboard/userApi';
import { FC } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';

type UserTableItem = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  activatedAt: Date | ActionButtonProps;
  role: string;
  actions: ActionButtonProps[];
};

export const UserListView: FC = () => {
  const { data: users = [] } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();
  const [forgotPassword] = useForgotPasswordMutation();
  const [resendActivationEmail] = useResendActivationEmailMutation();
  const { Modal: ConfirmationModal, openModal, closeModal } = useConfirmationModal();

  const getUsersFullName = (user: User) => `${user.firstName} ${user.lastName}`;

  const handleResendActivationEmail = (user: User) => {
    const message = `Resend Activation Email to ${getUsersFullName(user)}?`;

    const onConfirm = () => {
      resendActivationEmail({ id: user.id });
      closeModal();
    };

    const onCancel = () => closeModal();

    openModal(message, onConfirm, onCancel);
  };

  const handleDelete = (user: User) => {
    const message = `Delete ${getUsersFullName(user)}?`;

    const onConfirm = () => {
      deleteUser(user.id);
      closeModal();
    };

    const onCancel = () => closeModal();

    openModal(message, onConfirm, onCancel);
  };

  const handlePasswordReset = (user: User) => {
    const message = `Send Reset Password Email to ${getUsersFullName(user)}?`;

    const onConfirm = () => {
      forgotPassword({ email: user.email });
      closeModal();
    };

    const onCancel = () => closeModal();

    openModal(message, onConfirm, onCancel);
  };

  const headers: TableHeader<UserTableItem>[] = [
    { key: 'lastName', label: 'LAST NAME' },
    { key: 'firstName', label: 'FIRST NAME' },
    { key: 'email', label: 'EMAIL' },
    { key: 'role', label: 'ROLE' },
    { key: 'activatedAt', label: 'ACTIVATED' },
    { key: 'actions', label: 'ACTIONS' },
  ];

  const items: UserTableItem[] = users.map((user) => ({
    id: user.id,
    lastName: user.lastName,
    firstName: user.firstName,
    email: user.email,
    role: user.role.roleName,
    activatedAt: user.activatedAt
      ? new Date(user.activatedAt)
      : {
          icon: 'envelope',
          tooltipText: 'Resend Activation Email',
          onClick: () => handleResendActivationEmail(user),
        },
    actions: [
      { icon: 'edit', tooltipText: 'Edit', onClick: () => console.log(`Edit ${user.id}`) },
      {
        icon: 'trash-alt',
        tooltipText: 'Delete',

        onClick: () => handleDelete(user),
      },
      { icon: 'lock', tooltipText: 'Reset Password', onClick: () => handlePasswordReset(user) },
    ],
  }));

  const customRenderers: CustomRenderer<UserTableItem>[] = [
    {
      key: 'activatedAt',
      renderer: ({ activatedAt }) => (
        <>
          {activatedAt instanceof Date ? (
            new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(activatedAt)
          ) : (
            <ActionButton {...activatedAt} />
          )}
        </>
      ),
    },
    {
      key: 'actions',
      renderer: ({ actions }: UserTableItem) => (
        <>
          {actions.map((action, index) => (
            <ActionButton key={index} icon={action.icon} tooltipText={action.tooltipText} onClick={action.onClick} />
          ))}
        </>
      ),
    },
  ];

  return (
    <Container>
      <div className='mb-4 text-right'>
        <Button>ADD USER</Button>
      </div>
      <GenericTable<UserTableItem> headers={headers} items={items} customRenderers={customRenderers} />
      <ConfirmationModal />
    </Container>
  );
};