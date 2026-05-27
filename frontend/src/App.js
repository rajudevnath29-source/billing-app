import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import InvoiceCreate from "./pages/InvoiceCreate";
import InvoiceView from "./pages/InvoiceView";
import EditInvoice from "./pages/EditInvoice";

import Items from "./pages/Items";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";

import StockHistory from "./pages/StockHistory";

import Customers from "./pages/Customers";
import AddCustomer from "./pages/AddCustomer";
import PurchaseCreate from "./pages/PurchaseCreate";
import PurchaseView from "./pages/PurchaseView";

import Reports from "./pages/Reports";
import Expenses from "./pages/Expenses";

import CustomerLedger from "./pages/CustomerLedger";

import Payments from "./pages/Payments";
import Accounts from "./pages/Accounts";
import Vouchers from "./pages/Vouchers";
import UserList from "./pages/UserList";
import EditUser from "./pages/EditUser";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleGuard from "./components/RoleGuard";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* 🔐 AUTH */}
        <Route path="/" element={<Login />} />
        {/* <Route path="/auth" element={<AuthPage />} /> */}

        {/* 📊 DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* 📦 ITEMS */}
        <Route
          path="/items"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN", "ITEM_MANAGER"]}>
                <Items />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/items/add"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN", "ITEM_MANAGER"]}>
                <AddItem />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/items/edit/:id"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN", "ITEM_MANAGER"]}>
                <EditItem />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN", "ITEM_MANAGER"]}>
                <PurchaseCreate />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/purchase-view"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN", "ITEM_MANAGER"]}>
                <PurchaseView />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* 🧾 INVOICE */}
        <Route
          path="/invoice"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN", "INVOICE_USER"]}>
                <InvoiceCreate />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/invoice-view"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN", "INVOICE_USER"]}>
                <InvoiceView />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN", "INVOICE_USER"]}>
                <Customers />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/customers/add"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN", "INVOICE_USER"]}>
                <AddCustomer />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
                <Reports />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
        <Route
          path="/expenses"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
                <Expenses />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer-ledger"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN", "INVOICE_USER"]}>
                <CustomerLedger />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payments"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN", "INVOICE_USER"]}>
                <Payments />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/accounts"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
                <Accounts />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/vouchers"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
                <Vouchers />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/invoice-edit/:id"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN", "INVOICE_USER"]}></RoleGuard>
              <EditInvoice />
            </ProtectedRoute>
          }
        />

        <Route
          path="/stock-history"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
                <StockHistory />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        {/* USERS */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
                  <UserList />
              </RoleGuard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/edit/:id"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={["SUPER_ADMIN"]}>
                  <EditUser />
              </RoleGuard>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
