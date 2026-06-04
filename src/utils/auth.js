export const getUser = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    // Robust checks to handle both standard JWTs (three dot-separated segments)
    // and simple single-segment base64 token payloads.
    if (token.includes('.')) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } else {
      const payload = JSON.parse(atob(token));
      return payload;
    }
  } catch {
    return null;
  }
};

export const hasPermission = (role, action) => {
  if (role === 'Admin') return true;
  if (role === 'Manager') return action !== 'delete' && action !== 'userAccess';
  if (role === 'Viewer') return action === 'view';
  return false;
};
