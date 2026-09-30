import { createRoot } from "react-dom/client";
import App from "./App";
import { captureFirstTouch } from "./lib/lead";
import "./index.css";

// Visitors usually land from an ad on a page without a form, so remember the
// UTM tags now rather than when a form first renders.
captureFirstTouch();

createRoot(document.getElementById("root")!).render(<App />);
