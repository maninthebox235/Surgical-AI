import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./services/api', () => ({
  login: jest.fn(),
  register: jest.fn(),
  getCurrentUser: jest.fn().mockRejectedValue(new Error('unauthenticated')),
  logout: jest.fn(),
}));

test('renders login page when unauthenticated', async () => {
  render(<App />);
  expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
});
