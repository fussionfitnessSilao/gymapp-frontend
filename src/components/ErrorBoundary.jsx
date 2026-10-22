import { Component } from 'react';
import { clearTokens } from '../api/client';

/**
 * Red de seguridad: si algo falla al dibujar una pantalla, en lugar de dejar la app en blanco o negro
 * se ofrece recargar o volver al inicio de sesión.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error) {
    console.error('Error al mostrar la pantalla:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleLogin = () => {
    clearTokens();
    window.location.assign('/login');
  };

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="page-centered">
        <div className="card auth-card">
          <h1>Algo salió mal</h1>
          <p className="subtitle">Esta pantalla no pudo cargarse. Puedes intentar de nuevo o volver a iniciar sesión.</p>
          <button type="button" className="btn btn-primary btn-block" onClick={this.handleReload}>
            Recargar
          </button>
          <button type="button" className="btn btn-ghost btn-block" style={{ marginTop: '0.6rem' }} onClick={this.handleLogin}>
            Ir al inicio de sesión
          </button>
        </div>
      </div>
    );
  }
}
