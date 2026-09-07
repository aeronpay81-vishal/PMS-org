import AppLayout from "../layouts/AppLayout";

const Admin = ({ user, onLogout }) => {
  return <AppLayout user={user} onLogout={onLogout} />;
};

export default Admin;
