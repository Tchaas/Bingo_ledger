import { createBrowserRouter } from "react-router-dom";
import { AuthLayout } from "../components/AuthLayout";
import { MainLayout } from "../components/MainLayout";
import { LoginPage } from "../components/LoginPage";
import { SignupPage } from "../components/SignupPage";
import { LedgerPage } from "../components/LedgerPage";
import { TaxFormPage } from "../components/TaxFormPage";
import { ProfilePage } from "../components/ProfilePage";
import { CategoryReviewPage } from "../components/CategoryReviewPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { index: true, element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
    ],
  },
  {
    path: "/app",
    element: <MainLayout />,
    children: [
      { index: true, element: <LedgerPage /> },
      { path: "ledger", element: <LedgerPage /> },
      { path: "tax-form", element: <TaxFormPage /> },
      { path: "category-review", element: <CategoryReviewPage /> },
      { path: "profile", element: <ProfilePage /> },
    ],
  },
]);