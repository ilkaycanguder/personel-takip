import { RouterProvider } from "react-router-dom";
import router from "./configs/route";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import ErrorBoundary from "./components/ErrorBoundary";

const App = () => {
  return (
    <AuthProvider>
      <UserProvider>
        <ErrorBoundary>
          <RouterProvider router={router} />
        </ErrorBoundary>
      </UserProvider>
    </AuthProvider>
  );
};

export default App;
