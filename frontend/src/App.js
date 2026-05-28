import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";

import ProtectedRoute from "./components/ProtectedRoute";
import PermissionGuard from "./components/PermissionGuard";

import { hasPermission } from "./utils/permissions";

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

function App() {
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
              <PermissionGuard hasAccess={hasPermission("ITEMS_MODULE")}>
                <Items />
              </PermissionGuard>
            }
          />

          <Route
            path="/items/add"
            element={
              <PermissionGuard hasAccess={hasPermission("ADD_ITEM")}>
                <AddItem />
              </PermissionGuard>
            }
          />

          <Route
            path="/items/edit/:id"
            element={
              <PermissionGuard hasAccess={hasPermission("EDIT_ITEM")}>
                <EditItem />
              </PermissionGuard>
            }
          />

          {/* PURCHASE */}
          <Route
            path="/purchase"
            element={
              <PermissionGuard hasAccess={hasPermission("PURCHASE_MODULE")}>
                <PurchaseCreate />
              </PermissionGuard>
            }
          />

          <Route
            path="/purchase-view"
            element={
              <PermissionGuard hasAccess={hasPermission("VIEW_PURCHASE")}>
                <PurchaseView />
              </PermissionGuard>
            }
          />

          {/* INVOICE */}
          <Route
            path="/invoice"
            element={
              <PermissionGuard hasAccess={hasPermission("CREATE_INVOICE")}>
                <InvoiceCreate />
              </PermissionGuard>
            }
          />

          <Route
            path="/invoice-view"
            element={
              <PermissionGuard hasAccess={hasPermission("INVOICE_MODULE")}>
                <InvoiceView />
              </PermissionGuard>
            }
          />

          <Route
            path="/invoice-edit/:id"
            element={
              <PermissionGuard hasAccess={hasPermission("EDIT_INVOICE")}>
                <EditInvoice />
              </PermissionGuard>
            }
          />

          {/* CUSTOMERS */}
          <Route
            path="/customers"
            element={
              <PermissionGuard hasAccess={hasPermission("CUSTOMERS_MODULE")}>
                <Customers />
              </PermissionGuard>
            }
          />

          <Route
            path="/customers/add"
            element={
              <PermissionGuard hasAccess={hasPermission("ADD_CUSTOMER")}>
                <AddCustomer />
              </PermissionGuard>
            }
          />

          <Route
            path="/customer-ledger"
            element={
              <PermissionGuard hasAccess={hasPermission("CUSTOMER_LEDGER")}>
                <CustomerLedger />
              </PermissionGuard>
            }
          />

          {/* PAYMENTS */}
          <Route
            path="/payments"
            element={
              <PermissionGuard hasAccess={hasPermission("PAYMENTS_MODULE")}>
                <Payments />
              </PermissionGuard>
            }
          />

          {/* REPORTS */}
          <Route
            path="/reports"
            element={
              <PermissionGuard hasAccess={hasPermission("REPORTS_MODULE")}>
                <Reports />
              </PermissionGuard>
            }
          />

          {/* EXPENSES */}
          <Route
            path="/expenses"
            element={
              <PermissionGuard hasAccess={hasPermission("EXPENSES_MODULE")}>
                <Expenses />
              </PermissionGuard>
            }
          />

          {/* ACCOUNTS */}
          <Route
            path="/accounts"
            element={
              <PermissionGuard hasAccess={hasPermission("ACCOUNTS_MODULE")}>
                <Accounts />
              </PermissionGuard>
            }
          />

          {/* VOUCHERS */}
          <Route
            path="/vouchers"
            element={
              <PermissionGuard hasAccess={hasPermission("VOUCHERS_MODULE")}>
                <Vouchers />
              </PermissionGuard>
            }
          />

          {/* STOCK */}
          <Route
            path="/stock-history"
            element={
              <PermissionGuard hasAccess={hasPermission("STOCK_MODULE")}>
                <StockHistory />
              </PermissionGuard>
            }
          />

          {/* USERS */}
          <Route
            path="/users"
            element={
              <PermissionGuard hasAccess={hasPermission("USERS_MODULE")}>
                <UserList />
              </PermissionGuard>
            }
          />

          <Route
            path="/users/edit/:id"
            element={
              <PermissionGuard hasAccess={hasPermission("EDIT_USER")}>
                <EditUser />
              </PermissionGuard>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
