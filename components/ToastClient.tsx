// Enable client-side rendering
"use client";

import { Toaster } from "react-hot-toast";

// Toast container component for showing notifications
export default function ToastClient() {
  // Render the toaster in the top-right corner
  return <Toaster position="top-right" />;
}
