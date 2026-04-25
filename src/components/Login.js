import React, { useState } from 'react';
import Logo from './Logo';

const VALID_USERS = ['malala', 'chissie', 'koloina', 'ravo', 'mams'];
const VALID_PASSWORD = 'onboarding';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (VALID_USERS.includes(username.trim()) && password.trim() === VALID_PASSWORD) {
      setMessageType('success');
      setMessage('✅ Connexion réussie...');

      // Store user email/username
      sessionStorage.setItem('userEmail', username.trim());

      setTimeout(() => {
        onLogin();
      }, 1000);
    } else {
      setMessageType('error');
      setMessage('❌ Identifiants incorrects');
      setPassword('');
    }
  };

  return (
    <div className="login-overlay">
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <Logo size={60} />
            <h1>Authentification</h1>
            <p>Gestionnaire Collaborateurs - HRBP</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-group">
              <label htmlFor="username">Utilisateur</label>
              <input
                type="text"
                id="username"
                placeholder="Entrez votre identifiant"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {message && (
              <div className={`login-message show ${messageType}`}>
                {message}
              </div>
            )}

            <button type="submit" className="btn btn-login">
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
