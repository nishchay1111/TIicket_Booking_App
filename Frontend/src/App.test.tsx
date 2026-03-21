import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom'; // Required for .toBeInTheDocument() types
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  // HTMLElement is the return type for screen queries
  const linkElement: HTMLElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});