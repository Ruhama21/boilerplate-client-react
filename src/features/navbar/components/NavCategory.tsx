import { FC, PropsWithChildren } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const NavCategoryStyling = styled.div`
  display: block;
  &:not(:last-of-type) {
    border-bottom: 1px solid ${props => props.theme.buttons.defaultBackgroundColor};
  }

  & > .category {
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: ${props => props.theme.pages.p};
    transition: all 0.15s ease;

    &:hover {
      color: ${props => props.theme.textColor};
    }

    span {
      flex: 1;

      &.active {
        color: ${props => props.theme.textColor};
        font-weight: 600;
      }
    }

    svg {
      transition: all 0.15s ease;
    }
  }

  & > .content {
    visibility: hidden;
    max-height: 0;
    padding: 0 1rem;
    transition: all 0.15s ease;
    overflow: hidden;
    background: ${props => props.theme.backgroundColor};

    label {
      color: ${props => props.theme.textColor};
      font-weight: normal;
      font-size: 0.9rem;
    }
  }

  &.open {
    & > .category {
      color: ${props => props.theme.textColor};

      svg {
        transform: rotateZ(180deg);
      }
    }

    & > .content {
      visibility: visible;
      max-height: 250px;
      padding: 0 1rem 1rem;
    }
  }
`;

type Props = {
  title: string;
  handleCategorySelection: (category: string | null) => void;
};

export const NavCategory: FC<PropsWithChildren<Props> & React.HTMLAttributes<HTMLDivElement>> = ({
  title,
  className,
  handleCategorySelection,
  children,
}) => {
  const isCategoryOpen = () => {
    return className && className === 'open';
  };

  return (
    <NavCategoryStyling className={className}>
      <div
        role='button'
        tabIndex={-1}
        className='category'
        onClick={() => handleCategorySelection(isCategoryOpen() ? null : title)}
      >
        <span className={isCategoryOpen() ? 'active' : ''}>{title}</span>
        <FontAwesomeIcon icon='chevron-down' />
      </div>

      <div className='content'>{children}</div>
    </NavCategoryStyling>
  );
};