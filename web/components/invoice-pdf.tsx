"use client";

import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";
import { BUSINESS, CURRENCY } from "@/lib/catalog";

export type InvoiceLine = {
  id: string;
  name: string;
  qty: number;
  rate: number;
};

export type InvoiceData = {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerAddress: string;
  lines: InvoiceLine[];
  /**
   * Data URL (base64) of the business logo. Passed from the client after
   * loading /logo.png — kept optional so the PDF renders fine when the file
   * is missing.
   */
  logoDataUrl?: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111",
  },
  letterhead: {
    borderBottomWidth: 2,
    borderBottomColor: "#14532d",
    paddingBottom: 12,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 80, height: 80, objectFit: "contain" },
  brandText: { flexDirection: "column" },
  brandName: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 2,
    color: "#14532d",
    letterSpacing: 1,
  },
  brandTagline: { fontSize: 9, color: "#555", fontStyle: "italic" },
  contactBlock: { flexDirection: "column", textAlign: "right" },
  contactLine: { fontSize: 9, color: "#333", marginBottom: 1 },
  invoiceTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 8,
    letterSpacing: 1,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  metaCol: { flexDirection: "column", maxWidth: "48%" },
  metaLabel: {
    fontSize: 8,
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  metaValue: { fontSize: 10, marginBottom: 4 },
  table: { borderWidth: 1, borderColor: "#ddd" },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    padding: 6,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    padding: 6,
  },
  colIdx: { width: "8%" },
  colName: { width: "46%" },
  colQty: { width: "12%", textAlign: "right" },
  colRate: { width: "17%", textAlign: "right" },
  colAmt: { width: "17%", textAlign: "right" },
  totalsBlock: { marginTop: 12, alignSelf: "flex-end", width: "45%" },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalLabel: { color: "#555" },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#111",
    marginTop: 4,
    fontWeight: 700,
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    textAlign: "center",
    fontSize: 8,
    color: "#888",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 8,
  },
  thanks: { marginTop: 24, fontSize: 9, color: "#555" },
});

function money(n: number) {
  return `${CURRENCY} ${n.toFixed(2)}`;
}

export function InvoicePDF({ data }: { data: InvoiceData }) {
  const subtotal = data.lines.reduce((s, l) => s + l.qty * l.rate, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.letterhead}>
          <View style={styles.brand}>
            {data.logoDataUrl ? (
              <Image style={styles.logo} src={data.logoDataUrl} />
            ) : null}
            <View style={styles.brandText}>
              <Text style={styles.brandName}>{BUSINESS.name}</Text>
              <Text style={styles.brandTagline}>{BUSINESS.tagline}</Text>
            </View>
          </View>
          <View style={styles.contactBlock}>
            <Text style={styles.contactLine}>{BUSINESS.addressLine1}</Text>
            <Text style={styles.contactLine}>{BUSINESS.addressLine2}</Text>
            <Text style={styles.contactLine}>{BUSINESS.phone}</Text>
            {BUSINESS.email ? (
              <Text style={styles.contactLine}>{BUSINESS.email}</Text>
            ) : null}
            {BUSINESS.vat ? (
              <Text style={styles.contactLine}>VAT: {BUSINESS.vat}</Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.invoiceTitle}>INVOICE</Text>

        <View style={styles.metaRow}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Bill To</Text>
            <Text style={styles.metaValue}>
              {data.customerName || "Customer Name Placeholder"}
            </Text>
            <Text style={styles.metaValue}>
              {data.customerAddress || "Customer Address Placeholder"}
            </Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Invoice #</Text>
            <Text style={styles.metaValue}>{data.invoiceNumber}</Text>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>{data.invoiceDate}</Text>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.colIdx}>#</Text>
            <Text style={styles.colName}>Item</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colRate}>Rate</Text>
            <Text style={styles.colAmt}>Amount</Text>
          </View>
          {data.lines.map((l, i) => (
            <View key={l.id} style={styles.tableRow}>
              <Text style={styles.colIdx}>{i + 1}</Text>
              <Text style={styles.colName}>{l.name}</Text>
              <Text style={styles.colQty}>{l.qty}</Text>
              <Text style={styles.colRate}>{money(l.rate)}</Text>
              <Text style={styles.colAmt}>{money(l.qty * l.rate)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text>{money(subtotal)}</Text>
          </View>
          <View style={styles.grandTotalRow}>
            <Text>TOTAL</Text>
            <Text>{money(subtotal)}</Text>
          </View>
        </View>

        <Text style={styles.thanks}>
          Thank you for your business.
        </Text>

        <Text style={styles.footer}>
          {BUSINESS.name} · {BUSINESS.addressLine1}, {BUSINESS.addressLine2} ·{" "}
          {BUSINESS.phone}
        </Text>
      </Page>
    </Document>
  );
}
