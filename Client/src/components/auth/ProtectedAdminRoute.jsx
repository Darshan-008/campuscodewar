import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children }) => {
  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  // If no user or user role is not admin, redirect to login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, render the children components (protected content)
  return children;
};

ProtectedAdminRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedAdminRoute;
