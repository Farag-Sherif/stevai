import { Suspense } from "react";
import OrderDoneClient from "./OrderDoneClient";

// This route reads query params via `useSearchParams()` in a Client Component.
export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="page-content">
          <div
            className="container"
            style={{ paddingTop: 54, paddingBottom: 80, textAlign: "center" }}
          >
            Loading...
          </div>
        </div>
      }
    >
      <OrderDoneClient />
    </Suspense>
  );
}
