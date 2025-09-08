import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { Login } from "./components/Auth/Login";
import { SetPassword } from "./components/Auth/SetPassword";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { CollectionList } from "./components/Collections/CollectionList";
import { CollectionDetail } from "./components/Collections/CollectionDetail";
import { OrderList } from "./components/Orders/OrderList";
import { OrderManagement } from "./components/Orders/OrderManagement";
import { NewOrder } from "./components/Orders/NewOrder";
import { RetailerList } from "./components/Users/UserList";
import { Profile } from "./components/Profile/Profile";
import { Cart } from "./components/Cart/Cart";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading while authentication is being verified
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const { isDark } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#8B5CF6",
          colorBgContainer: isDark ? "#1F2937" : "#FFFFFF",
          colorBgElevated: isDark ? "#1F2937" : "#FFFFFF",
          colorBorder: isDark ? "#374151" : "#D1D5DB",
          colorText: isDark ? "#F9FAFB" : "#111827",
          colorTextSecondary: isDark ? "#9CA3AF" : "#6B7280",
          colorBgLayout: isDark ? "#111827" : "#F9FAFB",
        },
      }}
    >
      <Routes>
        <Route
          path="/login"
          element={
            loading ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/set-password"
          element={
            loading ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <SetPassword />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/collections"
          element={
            <PrivateRoute>
              <CollectionList />
            </PrivateRoute>
          }
        />
        <Route
          path="/collections/:id"
          element={
            <PrivateRoute>
              <CollectionDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute>
              <OrderList />
            </PrivateRoute>
          }
        />
        <Route
          path="/new-order"
          element={
            <PrivateRoute>
              <NewOrder />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders/:id/manage"
          element={
            <PrivateRoute>
              <OrderManagement />
            </PrivateRoute>
          }
        />
        <Route
          path="/users"
          element={
            <PrivateRoute>
              <RetailerList />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/"
          element={
            loading ? (
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <Navigate to="/dashboard" />
            )
          }
        />
      </Routes>
    </ConfigProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <AppRoutes />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
