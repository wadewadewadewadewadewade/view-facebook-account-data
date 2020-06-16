import React from 'react';
import { render, getByAltText } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  const { getByText } = render(<App />);
  const imageElement = document.querySelector('header .App-logo');
  expect(imageElement).toBeInTheDocument();
});
