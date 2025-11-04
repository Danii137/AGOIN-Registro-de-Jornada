
import React, { useState, useEffect, useRef } from 'react';
import type { Worker } from '../types';

interface WorkerManagerProps {
  workers: Worker[];
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
  isOpen: boolean;
  onClose: () => void;
}

const WorkerManager: React.FC<WorkerManagerProps> = ({ workers, setWorkers, isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [contractHours, setContractHours] = useState(40);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State for custom default times
  const [standardEntry, setStandardEntry] = useState('');
  const [standardStop, setStandardStop] = useState('');
  const [standardComeback, setStandardComeback] = useState('');
  const [standardExit, setStandardExit] = useState('');

  const fileInputRefs = useRef<{[key: string]: HTMLInputElement | null}>({});

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);
  
  const resetForm = () => {
    setName('');
    setDni('');
    setContractHours(40);
    setEditingId(null);
    setStandardEntry('');
    setStandardStop('');
    setStandardComeback('');
    setStandardExit('');
  }

  const handleSave = () => {
    if (!name || !dni) {
      alert('Nombre y DNI son obligatorios.');
      return;
    }
    const workerData = { 
        name, 
        dni, 
        contractHours,
        standardEntry: standardEntry || undefined,
        standardStop: standardStop || undefined,
        standardComeback: standardComeback || undefined,
        standardExit: standardExit || undefined,
    };

    if (editingId) {
      setWorkers(workers.map(w => w.id === editingId ? { ...w, ...workerData } : w));
    } else {
      setWorkers([...workers, { id: crypto.randomUUID(), ...workerData }]);
    }
    resetForm();
  };
  
  const handleEdit = (worker: Worker) => {
    setEditingId(worker.id);
    setName(worker.name);
    setDni(worker.dni);
    setContractHours(worker.contractHours);
    setStandardEntry(worker.standardEntry || '');
    setStandardStop(worker.standardStop || '');
    setStandardComeback(worker.standardComeback || '');
    setStandardExit(worker.standardExit || '');
  }
  
  const handleDelete = (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar este trabajador?')) {
      setWorkers(workers.filter(w => w.id !== id));
    }
  }

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>, workerId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setWorkers(prevWorkers => 
            prevWorkers.map(w => 
                w.id === workerId ? { ...w, signature: base64 } : w
            )
        );
    };
    reader.readAsDataURL(file);
    if(event.target) {
        event.target.value = '';
    }
  };

  const handleRemoveSignature = (workerId: string) => {
      setWorkers(prevWorkers => 
          prevWorkers.map(w => {
              if (w.id === workerId) {
                  const { signature, ...rest } = w;
                  return rest;
              }
              return w;
          })
      );
  };

  if (!isOpen) return null;

  const inputStyles = "mt-1 block w-full border border-gray-600 bg-agoin-darker rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-agoin-teal focus:border-agoin-teal text-agoin-light";
  const timeInputStyles = "mt-1 block w-full border border-gray-600 bg-agoin-darker rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-agoin-teal focus:border-agoin-teal text-agoin-light text-sm";


  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-agoin-dark rounded-lg shadow-xl p-6 w-full max-w-4xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-agoin-light">Gestionar Trabajadores</h2>
        
        {/* Form */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end mb-4 border-b border-gray-700 pb-4">
            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300">Nombre Completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyles}/>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300">DNI</label>
                <input type="text" value={dni} onChange={e => setDni(e.target.value)} className={inputStyles}/>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-300">Horas Contrato</label>
                <input type="number" value={contractHours} onChange={e => setContractHours(parseInt(e.target.value))} className={inputStyles}/>
            </div>
            <div className="flex items-end gap-2">
                <button onClick={handleSave} className="px-4 py-2 bg-agoin-green text-white rounded-md hover:bg-opacity-90 w-full">{editingId ? 'Actualizar' : 'Añadir'}</button>
                {editingId && <button onClick={resetForm} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500">Cancelar</button>}
            </div>
        </div>
        
        {/* Custom Schedule Section */}
        <fieldset className="mb-4 border-b border-gray-700 pb-4">
          <legend className="text-lg font-semibold text-agoin-light mb-2">Horario Predeterminado</legend>
          <p className="text-xs text-gray-400 mb-3 -mt-2">Opcional. Si se deja en blanco, se usará el horario estándar de la empresa (08:00 a 18:00).</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                  <label className="block text-sm font-medium text-gray-300">Entrada</label>
                  <input type="time" value={standardEntry} onChange={e => setStandardEntry(e.target.value)} className={timeInputStyles}/>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-300">Parada</label>
                  <input type="time" value={standardStop} onChange={e => setStandardStop(e.target.value)} className={timeInputStyles}/>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-300">Regreso</label>
                  <input type="time" value={standardComeback} onChange={e => setStandardComeback(e.target.value)} className={timeInputStyles}/>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-300">Salida</label>
                  <input type="time" value={standardExit} onChange={e => setStandardExit(e.target.value)} className={timeInputStyles}/>
              </div>
          </div>
        </fieldset>

        {/* Worker List */}
        <div className="max-h-60 overflow-y-auto">
            <ul className="divide-y divide-gray-700">
                {workers.map(worker => (
                    <li key={worker.id} className="py-3 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex items-center gap-4 flex-grow min-w-0">
                            {worker.signature ? (
                                <img src={worker.signature} alt="Firma" className="h-10 w-20 object-contain border p-1 bg-agoin-darker border-gray-700 rounded flex-shrink-0" />
                            ) : (
                                <div className="h-10 w-20 border border-gray-700 flex items-center justify-center bg-agoin-darker rounded text-xs text-gray-500 flex-shrink-0">Sin firma</div>
                            )}
                            <div className="min-w-0">
                                <p className="font-semibold text-agoin-light truncate">{worker.name}</p>
                                <p className="text-sm text-gray-400">{worker.dni} - {worker.contractHours} horas</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-start md:justify-end md:flex-shrink-0">
                            <input type="file" accept="image/jpeg,image/png" ref={el => { fileInputRefs.current[worker.id] = el; }} onChange={(e) => handleSignatureUpload(e, worker.id)} className="hidden"/>
                            <button onClick={() => fileInputRefs.current[worker.id]?.click()} className="px-2 py-1 text-xs font-medium text-white bg-agoin-teal rounded-md hover:bg-opacity-90">
                                {worker.signature ? 'Cambiar Firma' : 'Añadir Firma'}
                            </button>
                            {worker.signature && <button onClick={() => handleRemoveSignature(worker.id)} className="px-2 py-1 text-xs font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600">Quitar</button>}
                            <button onClick={() => handleEdit(worker)} className="px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">Editar</button>
                            <button onClick={() => handleDelete(worker.id)} className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded-md hover:bg-red-700">Eliminar</button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

export default WorkerManager;