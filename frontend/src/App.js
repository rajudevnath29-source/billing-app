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

import PurchaseCreate from "./pages/PurchaseCreate";
import PurchaseView from "./pages/PurchaseView";

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

          {/* PROFILE */}
          <Route path="/profile" element={<Profile />} />

          {/* ITEMS */}
          <Route
            path="/items"
            element={
              <PermissionGuard permission="ITEMS_MODULE">
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
              <PermissionGuard permission="PURCHASE_MODULE">
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

          {/* CUSTOMERS */}
          <Route
            path="/customers"
            element={
              <PermissionGuard permission="CUSTOMERS_MODULE">
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
              <PermissionGuard permission="PAYMENTS_MODULE">
                <Payments />
              </PermissionGuard>
            }
          />

          {/* REPORTS */}
          <Route
            path="/reports"
            element={
              <PermissionGuard permission="REPORTS_MODULE">
                <Reports />
              </PermissionGuard>
            }
          />

          {/* EXPENSES */}
          <Route
            path="/expenses"
            element={
              <PermissionGuard permission="EXPENSES_MODULE">
                <Expenses />
              </PermissionGuard>
            }
          />

          {/* ACCOUNTS */}
          <Route
            path="/accounts"
            element={
              <PermissionGuard permission="ACCOUNTS_MODULE">
                <Accounts />
              </PermissionGuard>
            }
          />

          {/* VOUCHERS */}
          <Route
            path="/vouchers"
            element={
              <PermissionGuard permission="VOUCHERS_MODULE">
                <Vouchers />
              </PermissionGuard>
            }
          />

          {/* STOCK */}
          <Route
            path="/stock-history"
            element={
              <PermissionGuard permission="STOCK_MODULE">
                <StockHistory />
              </PermissionGuard>
            }
          />

          {/* USERS */}
          <Route
            path="/users"
            element={
              <PermissionGuard permission="USERS_MODULE">
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
