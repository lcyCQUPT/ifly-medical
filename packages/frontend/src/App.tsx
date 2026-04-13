import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfilePage } from './pages/ProfilePage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <ProfilePage />
      </div>
    </QueryClientProvider>
  );
}

export default App;
