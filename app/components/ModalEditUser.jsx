import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function ModalEditUser({ isOpen, onClose, data, onSave, styles }) {
  const [namaBaru, setNamaBaru] = useState('');

  // Sinkronisasi data anggota yang diklik ke dalam form modal
  useEffect(() => {
    if (data) {
      setNamaBaru(data.nama || '');
    }
  }, [data]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Munculkan SweetAlert konfirmasi sebelum di-save
    const res = await MySwal.fire({ 
      title: 'Update Anggota?', 
      text: `Apakah kamu yakin ingin mengubah nama menjadi "${namaBaru}"?`,
      icon: 'question', 
      showCancelButton: true, 
      confirmButtonColor: '#10b981', 
      background: '#111', 
      color: '#fff' 
    });

    // Jika user klik "Yes/OK", baru lempar data ke fungsi onSave di page.jsx
    if (res.isConfirmed) {
      onSave(data.id, namaBaru);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBody}>
        <button onClick={onClose} className={styles.closeButton}>✕</button>
        <h2 className="text-xs font-bold mb-4 uppercase tracking-widest text-emerald-500">
          Edit Anggota
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nama Anggota</label>
            <input 
              type="text" 
              className={styles.input} 
              value={namaBaru} 
              onChange={e => setNamaBaru(e.target.value)} 
              placeholder="Masukkan nama baru..."
              required 
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className={styles.buttonDelete}>Batal</button>
            <button type="submit" className={styles.buttonSubmit}>Update Data</button>
          </div>
        </form>
      </div>
    </div>
  );
}