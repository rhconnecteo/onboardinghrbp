import React, { useState } from 'react';

function ImportSection() {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      setMessage('❌ Fichier non supporté. Utilisez: .xlsx, .xls ou .csv');
      setMessageType('error');
      return;
    }

    setMessage('✅ ' + file.name);
    setMessageType('success');
  };

  return (
    <div>
      <h2>Importer Excel</h2>

      {message && (
        <div className={`message show ${messageType}`}>
          {message}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="excelFile">Sélectionner fichier</label>
        <input
          type="file"
          id="excelFile"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}

export default ImportSection;
