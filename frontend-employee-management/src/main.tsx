import ReactDOM from "react-dom/client";
import "./styles/index.css"; // Global stil dosyasını içe aktarın
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap stil dosyasını içe aktarın
import App from "./App"; // Ana uygulama bileşenini içe aktarın

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
