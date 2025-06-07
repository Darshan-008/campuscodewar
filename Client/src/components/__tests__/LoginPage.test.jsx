import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage'; // ✅ Only import, no duplicate declaration!

// ✅ Mock the auth service
vi.mock('../../services/authService', () => ({
  login: vi.fn(),
}));

describe('LoginPage', () => {
  it('renders login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation error for empty email', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/please enter.*email/i)).toBeInTheDocument();
  });

  it('shows validation error for empty email - alternative test', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const submitButton = screen.getByRole('button', { name: /sign in/i });

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: '' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/please enter.*email/i)).toBeInTheDocument();
  });
});
