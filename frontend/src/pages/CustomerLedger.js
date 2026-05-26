import {
  useEffect,
  useState
} from "react";

import axios from "axios";

import Layout from "../components/Layout";

export default function CustomerLedger() {

  const [customers, setCustomers] =
    useState([]);

  const [selectedCustomer,
    setSelectedCustomer] =
    useState(null);

  const [customerInvoices,
    setCustomerInvoices] =
    useState([]);

  const token =
    localStorage.getItem("token");

  // ====================================
  // LOAD CUSTOMERS
  // ====================================

  const fetchCustomers =
    async () => {

      try {

        const res =
          await axios.get(

            "http://localhost:5000/api/customers",

            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }

          );

        setCustomers(
          res.data.customers
        );

      } catch (error) {

        console.log(error);

      }

    };

  useEffect(() => {

    fetchCustomers();

  }, []);

  // ====================================
  // OPEN CUSTOMER LEDGER
  // ====================================

  const openLedger =
    async (customer) => {

      try {

        setSelectedCustomer(
          customer
        );

        const res =
          await axios.get(

            `http://localhost:5000/api/invoices/customer/${customer._id}`,

            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }

          );

        setCustomerInvoices(
          res.data.invoices
        );

      } catch (error) {

        console.log(error);

      }

    };

  // ====================================
  // TOTAL
  // ====================================

  const totalSales =
    customerInvoices.reduce(

      (sum, inv) =>
        sum + inv.grand_total,

      0

    );

  return (

    <Layout>

      <div style={page}>

        <h1>
          📒 Customer Ledger
        </h1>

        <div style={mainBox}>

          {/* LEFT */}

          <div style={leftBox}>

            {customers.map((customer) => (

              <div
                key={customer._id}
                style={customerCard}
                onClick={() =>
                  openLedger(customer)
                }
              >

                <h3>
                  {
                    customer.customer_name
                  }
                </h3>

                <p>
                  {
                    customer.mobile
                  }
                </p>

              </div>

            ))}

          </div>

          {/* RIGHT */}

          <div style={rightBox}>

            {selectedCustomer ? (

              <>

                <div style={topCard}>

                  <h2>
                    {
                      selectedCustomer.customer_name
                    }
                  </h2>

                  <p>
                    📱
                    {" "}
                    {
                      selectedCustomer.mobile
                    }
                  </p>

                  <h3>

                    Total Sales:
                    {" "}

                    ₹
                    {" "}

                    {
                      totalSales.toFixed(2)
                    }

                  </h3>

                </div>

                {/* TABLE */}

                <table style={table}>

                  <thead>

                    <tr>

                      <th>
                        Invoice No
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Amount
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {customerInvoices.map(
                      (invoice) => (

                      <tr
                        key={invoice._id}
                      >

                        <td>
                          {
                            invoice.invoice_number
                          }
                        </td>

                        <td>

                          {
                            new Date(
                              invoice.createdAt
                            ).toLocaleDateString()
                          }

                        </td>

                        <td>
                          ₹
                          {" "}
                          {
                            invoice.grand_total
                          }
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </>

            ) : (

              <div style={emptyBox}>

                <h2>
                  Select Customer
                </h2>

              </div>

            )}

          </div>

        </div>

      </div>

    </Layout>

  );

}

/* ====================================
   STYLES
==================================== */

const page = {
  padding: 20
};

const mainBox = {
  display: "flex",
  gap: 20,
  marginTop: 20
};

const leftBox = {
  width: "30%",
  background: "#fff",
  borderRadius: 10,
  padding: 15,
  height: "80vh",
  overflowY: "auto"
};

const rightBox = {
  width: "70%"
};

const customerCard = {
  padding: 15,
  borderBottom: "1px solid #eee",
  cursor: "pointer"
};

const topCard = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  marginBottom: 20
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff"
};

const emptyBox = {
  background: "#fff",
  padding: 50,
  borderRadius: 10,
  textAlign: "center"
};