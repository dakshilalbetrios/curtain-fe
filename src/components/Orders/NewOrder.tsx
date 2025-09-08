import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../Layout/MainLayout";

export const NewOrder: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to cart page when this component is accessed
    navigate("/cart");
  }, [navigate]);

  return (
    <MainLayout title="New Order" showCart={true}>
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="theme-text-secondary">Redirecting to cart...</p>
        </div>
      </div>
    </MainLayout>
  );
};
