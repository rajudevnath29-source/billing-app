import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { refreshUser } from "./utils/authRefresh";

import Layout from "./components/Layout";

import ProtectedRoute from "./components/ProtectedRoute";
import PermissionGuard from "./components/PermissionGuard";

// PAGES
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

import Items from "./pages/Items";
import AddItem from "./pages/AddItem";
import EditItem from "./pages/EditItem";

import InvoiceCreate from "./pages/InvoiceCreate";
import InvoiceView from "./pages/InvoiceView";
import EditInvoice from "./pages/EditInvoice";

import Customers from "./pages/Customers";
import AddCustomer from "./pages/AddCustomer";
import EditCustomer from "./pages/EditCustomer";

import PurchaseCreate from "./pages/PurchaseCreate";
import PurchaseView from "./pages/PurchaseView";
import EditPurchase from "./pages/EditPurchase";

import Reports from "./pages/Reports";
import Expenses from "./pages/Expenses";

import CustomerLedger from "./pages/CustomerLedger";

import Payments from "./pages/Payments";

import Accounts from "./pages/Accounts";
import Vouchers from "./pages/Vouchers";

import StockHistory from "./pages/StockHistory";

import UserList from "./pages/UserList";
import EditUser from "./pages/EditUser";
import PermissionManager from "./pages/PermissionManager";

import RoleManager from "./pages/RoleManager";
import BulkInvoice from "./pages/BulkInvoice";
import GstSettings from "./pages/GstSettings";
import GstReports from "./pages/GstReports";
// import UserAccessManager from "./pages/UserAccessManager";

function App() {
  useEffect(() => {
    refreshUser();
  }, []);
  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* PROTECTED */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* DASHBOARD */}
          <Route path="/dashboard" element={<Dashboard />} />
          {/* <Route path="/user-access" element={<UserAccessManager />} /> */}

          {/* PROFILE */}
          <Route path="/profile" element={<Profile />} />

          {/* ITEMS */}
          <Route
            path="/items"
            element={
              <PermissionGuard permission="VIEW_ITEM">
                <Items />
              </PermissionGuard>
            }
          />

          <Route
            path="/items/add"
            element={
              <PermissionGuard permission="ADD_ITEM">
                <AddItem />
              </PermissionGuard>
            }
          />

          <Route
            path="/items/edit/:id"
            element={
              <PermissionGuard permission="EDIT_ITEM">
                <EditItem />
              </PermissionGuard>
            }
          />

          {/* PURCHASE */}
          <Route
            path="/purchase"
            element={
              <PermissionGuard permission="CREATE_PURCHASE">
                <PurchaseCreate />
              </PermissionGuard>
            }
          />

          <Route
            path="/purchase-view"
            element={
              <PermissionGuard permission="VIEW_PURCHASE">
                <PurchaseView />
              </PermissionGuard>
            }
          />

          <Route
            path="/purchase-edit/:id"
            element={
              <PermissionGuard permission="EDIT_PURCHASE">
                <EditPurchase />
              </PermissionGuard>
            }
          />

          {/* INVOICE */}
          <Route
            path="/invoice"
            element={
              <PermissionGuard permission="CREATE_INVOICE">
                <InvoiceCreate />
              </PermissionGuard>
            }
          />

          <Route
            path="/invoice-view"
            element={
              <PermissionGuard permission="VIEW_INVOICE">
                <InvoiceView />
              </PermissionGuard>
            }
          />

          <Route
            path="/invoice-edit/:id"
            element={
              <PermissionGuard permission="EDIT_INVOICE">
                <EditInvoice />
              </PermissionGuard>
            }
          />

          <Route
            path="/bulk-invoice"
            element={
              <PermissionGuard permission="BULK_INVOICE">
                <BulkInvoice />
              </PermissionGuard>
            }
          />

          {/* CUSTOMERS */}
          <Route
            path="/customers"
            element={
              <PermissionGuard permission="VIEW_CUSTOMER">
                <Customers />
              </PermissionGuard>
            }
          />

          <Route
            path="/customers/add"
            element={
              <PermissionGuard permission="ADD_CUSTOMER">
                <AddCustomer />
              </PermissionGuard>
            }
          />

          <Route
            path="/customers/edit/:id"
            element={
              <PermissionGuard permission="EDIT_CUSTOMER">
                <EditCustomer />
              </PermissionGuard>
            }
          />

          <Route
            path="/customer-ledger"
            element={
              <PermissionGuard permission="CUSTOMER_LEDGER">
                <CustomerLedger />
              </PermissionGuard>
            }
          />

          {/* PAYMENTS */}
          <Route
            path="/payments"
            element={
              <PermissionGuard permission="VIEW_PAYMENT">
                <Payments />
              </PermissionGuard>
            }
          />

          {/* REPORTS */}
          <Route
            path="/reports"
            element={
              <PermissionGuard permission="VIEW_REPORT">
                <Reports />
              </PermissionGuard>
            }
          />

          {/* EXPENSES */}
          <Route
            path="/expenses"
            element={
              <PermissionGuard permission="VIEW_EXPENSE">
                <Expenses />
              </PermissionGuard>
            }
          />

          {/* ACCOUNTS */}
          <Route
            path="/accounts"
            element={
              <PermissionGuard permission="VIEW_ACCOUNT">
                <Accounts />
              </PermissionGuard>
            }
          />

          {/* VOUCHERS */}
          <Route
            path="/vouchers"
            element={
              <PermissionGuard permission="VIEW_VOUCHER">
                <Vouchers />
              </PermissionGuard>
            }
          />

          {/* GST SETTINGS */}
          <Route
            path="/gst-settings"
            element={
              <PermissionGuard permission="VIEW_ACCOUNT">
                <GstSettings />
              </PermissionGuard>
            }
          />

          {/* GST REPORTS */}
          <Route
            path="/gst-reports"
            element={
              <PermissionGuard permission="VIEW_REPORT">
                <GstReports />
              </PermissionGuard>
            }
          />

          {/* STOCK */}
          <Route
            path="/stock-history"
            element={
              <PermissionGuard permission="VIEW_STOCK">
                <StockHistory />
              </PermissionGuard>
            }
          />

          {/* USERS */}
          <Route
            path="/users"
            element={
              <PermissionGuard permission="VIEW_USER">
                <UserList />
              </PermissionGuard>
            }
          />

          <Route
            path="/users/edit/:id"
            element={
              <PermissionGuard permission="EDIT_USER">
                <EditUser />
              </PermissionGuard>
            }
          />

          {/* ROLES */}
          <Route
            path="/roles"
            element={
              <PermissionGuard permission="MANAGE_ROLES">
                <RoleManager />
              </PermissionGuard>
            }
          />

          {/* PERMISSIONS */}
          <Route
            path="/permissions"
            element={
              <PermissionGuard permission="MANAGE_PERMISSIONS">
                <PermissionManager />
              </PermissionGuard>
            }
          />
          {/* <Route
            path="/permission-manager"
            element={
              <PermissionGuard permission="">
                <PermissionManager />
              </PermissionGuard>
            }
          /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
