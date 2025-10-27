
  import { createRoot } from "react-dom/client";
  import AppApi from "./AppApi.tsx";  // App → AppApi로 변경 (백엔드 API 연동)
  // import App from "./App.tsx";  // 하드코딩 데이터 버전
  import "./index.css";

  createRoot(document.getElementById("root")!).render(<AppApi />);
  