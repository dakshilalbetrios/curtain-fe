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
import { OrderDetail } from "./components/Orders/OrderDetail";
import { OrderManagement } from "./components/Orders/OrderManagement";
import { RetailerList } from "./components/Users/UserList";
import { ManageCollectionAccess } from "./components/Users/ManageCollectionAccess";
import { Profile } from "./components/Profile/Profile";
import { Cart } from "./components/Cart/Cart";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
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
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/set-password"
          element={
            isAuthenticated ? <Navigate to="/dashboard" /> : <SetPassword />
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
          path="/orders/:id"
          element={
            <PrivateRoute>
              <OrderDetail />
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
          path="/users/manage-collection-access/:userId"
          element={
            <PrivateRoute>
              <ManageCollectionAccess />
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
        <Route path="/" element={<Navigate to="/dashboard" />} />
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
