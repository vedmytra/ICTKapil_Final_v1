// Compatibility shim: ported Phase 2/5 code imports from "@/lib/firebase".
// The canonical, working Firebase client (with HMR-safe init) lives in
// "@/lib/firebase/client" — re-export from there instead of duplicating it.
export { auth, db, storage } from "@/lib/firebase/client";
export { default } from "@/lib/firebase/client";
