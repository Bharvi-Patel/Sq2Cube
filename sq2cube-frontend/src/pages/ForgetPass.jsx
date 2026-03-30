import { Navigate } from "react-router-dom";

/** Legacy path `/forgetPass` — same flow as `/forgot-password` (API + resend timer). */
export default function ForgetPass() {
  return <Navigate to="/forgot-password" replace />;
}
