import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VisitsPage } from './pages/VisitsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <VisitsPage />
      </div>
    </QueryClientProvider>
  );
}

export default App;
