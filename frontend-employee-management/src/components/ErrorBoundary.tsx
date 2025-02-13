import React, { Component, ErrorInfo } from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Güncellenmiş hata durumunu ayarla
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Hata raporlaması veya hata günlüğü yapılabilir
    console.error("Hata:", error);
    console.error("Hata Bilgisi:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Hata durumunda gösterilecek kullanıcı arayüzü
      return (
        <div>
          <h1>Bir hata oluştu.</h1>
          <p>Üzgünüz, bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
