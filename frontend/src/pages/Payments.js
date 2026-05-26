import {
  useEffect,
  useState
} from "react";

import axios from "axios";

import Layout from "../components/Layout";

export default function Payments() {

  const [invoices, setInvoices] =
    useState([]);

  const [payments, setPayments] =
    useState([]);

  const [selectedInvoice,
    setSelectedInvoice] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [note, setNote] =
    useState("");

  const token =
    localStorage.getItem("token");

  // ====================================
  // LOAD
  // ====================================

  const loadData =
    async () => {

      try {

        // DUE INVOICES

        const invoiceRes =
          await axios.get(

            "http://localhost:5000/api/invoices",

            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }

          );

        const dueInvoices =
          invoiceRes.data.invoices
            .filter(

              (inv) =>
                inv.due_amount > 0

            );

        setInvoices(
          dueInvoices
        );

        // PAYMENTS

        const paymentRes =
          await axios.get(

            "http://localhost:5000/api/payments",

            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }

          );

        setPayments(
          paymentRes.data.payments
        );

      } catch (error) {

        console.log(error);

      }

    };

  useEffect(() => {

    loadData();

  }, []);

  // ====================================
  // CREATE PAYMENT
  // ====================================

  const collectPayment =
    async () => {

      try {

        const invoiceData =
          invoices.find(

            (i) =>
              i._id ===
              selectedInvoice

          );

        await axios.post(

          "http://localhost:5000/api/payments",

          {

            customer:
              invoiceData.customer,

            invoice:
              invoiceData._id,

            amount,

            note

          },

          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }

        );

        alert(
          "Payment collected"
        );

        setSelectedInvoice("");
        setAmount("");
        setNote("");

        loadData();

      } catch (error) {

        console.log(error);

      }

    };

  return (

    <Layout>

      <div style={page}>

        <h1>
          💰 Payment Collection
        </h1>

        {/* FORM */}

        <div style={formBox}>

          <select
            value={selectedInvoice}
            onChange={(e) =>
              setSelectedInvoice(
                e.target.value
              )
            }
          >

            <option value="">
              Select Invoice
            </option>

            {invoices.map((inv) => (

              <option
                key={inv._id}
                value={inv._id}
              >

                {
                  inv.invoice_number
                }

                {" - "}

                {
                  inv.customer_name
                }

                {" - Due ₹"}

                {
                  inv.due_amount
                }

              </option>

            ))}

          </select>

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target.value
              )
            }
          />

          <input
            placeholder="Note"
            value={note}
            onChange={(e) =>
              setNote(
                e.target.value
              )
            }
          />

          <button
            onClick={
              collectPayment
            }
          >
            Collect
          </button>

        </div>

        {/* PAYMENT HISTORY */}

        <table style={table}>

          <thead>

            <tr>

              <th>
                Invoice
              </th>

              <th>
                Amount
              </th>

              <th>
                Date
              </th>

              <th>
                Note
              </th>

            </tr>

          </thead>

          <tbody>

            {payments.map((pay) => (

              <tr key={pay._id}>

                <td>

                  {
                    pay.invoice
                      ?.invoice_number
                  }

                </td>

                <td>

                  ₹
                  {" "}

                  {
                    pay.amount
                  }

                </td>

                <td>

                  {
                    new Date(
                      pay.createdAt
                    ).toLocaleDateString()
                  }

                </td>

                <td>
                  {pay.note}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

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

const formBox = {
  display: "grid",
  gridTemplateColumns:
    "2fr 1fr 2fr 1fr",
  gap: 10,
  marginBottom: 20
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff"
};