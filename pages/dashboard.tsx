import { SocketProvider } from "../contexts/socket";
import Dashboard from "../components/dashboard-page/Dashboard";

const DashboardPage = () => {
  return (
    <SocketProvider>
      <Dashboard />
    </SocketProvider>
  );
};

export default DashboardPage;
