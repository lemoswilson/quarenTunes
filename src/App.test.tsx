import React from 'react';
import { render } from '@testing-library/react';
import Xolombrisx from './App';

test('renders learn react link', () => {
  const { getByText } = render(<Xolombrisx />);
  const linkElement = getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
