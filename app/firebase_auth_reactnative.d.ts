
declare module "firebase/auth/react-native" {
  import type { FirebaseApp } from "firebase/app";

  // loose typing is fine here — runtime has the functions we need
  export function initializeAuth(app: FirebaseApp, options?: any): any;
  export function getReactNativePersistence(storage: any): any;
}
