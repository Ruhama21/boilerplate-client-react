import renderer from 'react-test-renderer';
import { expectToMatchSnapshot } from '../../../utils/test';
import { StyledForm, Title, FormLabel, InputError, ButtonWrapper, CancelButton, LogInButton } from '../styled';

import 'jest-styled-components';

describe('<LogInForm /> styled components', () => {
  it('should match the stored <StyledForm /> snapshot', () => expectToMatchSnapshot(<StyledForm />));

  it('should match the stored <Title /> snapshot', () => expectToMatchSnapshot(<Title />));

  it('should match the stored <InputError /> snapshot', () => expectToMatchSnapshot(<InputError />));

  it('should match the stored <ButtonWrapper /> snapshot', () => expectToMatchSnapshot(<ButtonWrapper />));

  it('should match the stored <FormLabel /> snapshot', () =>
    expect(renderer.create(<FormLabel />).toJSON()).toMatchSnapshot());

  it('should match the stored <CancelButton /> snapshot', () =>
    expect(renderer.create(<CancelButton />).toJSON()).toMatchSnapshot());

  it('should match the stored <SubmitButton /> snapshot', () =>
    expect(renderer.create(<LogInButton />).toJSON()).toMatchSnapshot());
});