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
import { Login } from "./components/Auth/Login";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { CollectionList } from "./components/Collections/CollectionList";
import { CollectionDetail } from "./components/Collections/CollectionDetail";
import { AddCollection } from "./components/Collections/AddCollection";
import { OrderList } from "./components/Orders/OrderList";
import { OrderDetail } from "./components/Orders/OrderDetail";
import { OrderManagement } from "./components/Orders/OrderManagement";
import { RetailerList } from "./components/Users/UserList";
import { AddRetailer } from "./components/Users/AddUser";
import { ManageCollectionAccess } from "./components/Users/ManageCollectionAccess";
import { Profile } from "./components/Profile/Profile";
import { EditProfile } from "./components/Profile/EditProfile";
import { ChangePassword } from "./components/Profile/ChangePassword";
import { Cart } from "./components/Cart/Cart";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
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
        path="/collections/add"
        element={
          <PrivateRoute>
            <AddCollection />
          </PrivateRoute>
        }
      />
      <Route
        path="/collections/edit/:id"
        element={
          <PrivateRoute>
            <AddCollection />
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
        path="/users/add"
        element={
          <PrivateRoute>
            <AddRetailer />
          </PrivateRoute>
        }
      />
      <Route
        path="/users/edit/:id"
        element={
          <PrivateRoute>
            <AddRetailer />
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
        path="/profile/edit"
        element={
          <PrivateRoute>
            <EditProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile/change-password"
        element={
          <PrivateRoute>
            <ChangePassword />
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
  );
};

function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#8B5CF6",
          colorBgContainer: "#1F2937",
          colorBgElevated: "#1F2937",
          colorBorder: "#374151",
          colorText: "#F9FAFB",
          colorTextSecondary: "#9CA3AF",
        },
      }}
    >
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <AppRoutes />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;
