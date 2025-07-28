import { Suspense } from "react";
import LoginComponent from "./LoginComponent";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginComponent />
    </Suspense>
  );
}