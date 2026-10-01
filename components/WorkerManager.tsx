import React, { useEffect, useRef, useState } from 'react';
import type { Worker } from '../types';

interface WorkerManagerProps {
  workers: Worker[];
  setWorkers: React.Dispatch<React.SetStateAction<Worker[]>>;
  isOpen: boolean;
  onClose: () => void;
  initialSelectedWorkerId: string | null;
}

const NEW_WORKER_VALUE = '__new_worker__';

const WorkerManager: React.FC<WorkerManagerProps> = ({
  workers,
  setWorkers,
  isOpen,
  onClose,
  initialSelectedWorkerId,
}) => {
  const [name, setName] = useState('');
  const [dni, setDni] = useState('');
  const [contractHours, setContractHours] = useState(40);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [hasBreak, setHasBreak] = useState(true);
  const [standardEntry, setStandardEntry] = useState('');
  const [standardStop, setStandardStop] = useState('');
  const [standardComeback, setStandardComeback] = useState('');
  const [standardExit, setStandardExit] = useState('');
  const [localWorkers, setLocalWorkers] = useState<Worker[]>([]);

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    if (!isOpen) return;

    setLocalWorkers(workers);
    setSaveFeedback(null);

    const workerToEdit = workers.find((worker) => worker.id === initialSelectedWorkerId);
    if (workerToEdit) {
      loadWorkerIntoForm(workerToEdit);
      return;
    }

    resetForm();
  }, [isOpen, workers, initialSelectedWorkerId]);

  useEffect(() => {
    if (!saveFeedback) return;

    const timeoutId = window.setTimeout(() => {
      setSaveFeedback(null);
    }, 2500);

    return () => window.clearTimeout(timeoutId);
  }, [saveFeedback]);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setDni('');
    setContractHours(40);
    setSaveFeedback(null);
    setHasBreak(true);
    setStandardEntry('');
    setStandardStop('');
    setStandardComeback('');
    setStandardExit('');
  };

  const loadWorkerIntoForm = (worker: Worker) => {
    setEditingId(worker.id);
    setName(worker.name);
    setDni(worker.dni);
    setContractHours(worker.contractHours);
    setHasBreak(worker.hasBreak !== false);
    setStandardEntry(worker.standardEntry || '');
    setStandardStop(worker.standardStop || '');
    setStandardComeback(worker.standardComeback || '');
    setStandardExit(worker.standardExit || '');
  };

  const buildWorkerData = () => {
    if (!name.trim() || !dni.trim()) {
      alert('Nombre y DNI son obligatorios.');
      return null;
    }

    if (!hasBreak && (!standardEntry || !standardExit)) {
      alert('Para una jornada continua debes indicar al menos la hora de entrada y salida.');
      return null;
    }

    return {
      name: name.trim(),
      dni: dni.trim(),
      contractHours,
      hasBreak,
      standardEntry: standardEntry || undefined,
      standardStop: hasBreak ? (standardStop || undefined) : undefined,
      standardComeback: hasBreak ? (standardComeback || undefined) : undefined,
      standardExit: standardExit || undefined,
    };
  };

  const applyWorkerToList = (workerList: Worker[], workerData: Omit<Worker, 'id' | 'signature'>) => {
    if (editingId) {
      return {
        nextWorkers: workerList.map((worker) =>
          worker.id === editingId ? { ...worker, ...workerData } : worker
        ),
        nextEditingId: editingId,
      };
    }

    const nextId = crypto.randomUUID();
    return {
      nextWorkers: [...workerList, { id: nextId, ...workerData }],
      nextEditingId: nextId,
    };
  };

  const hasPendingFormChanges = () => {
    return Boolean(
      editingId ||
      name.trim() ||
      dni.trim() ||
      contractHours !== 40 ||
      !hasBreak ||
      standardEntry ||
      standardStop ||
      standardComeback ||
      standardExit
    );
  };

  const handleSaveWorkerData = () => {
    const workerData = buildWorkerData();
    if (!workerData) return;

    const wasEditing = Boolean(editingId);
    const { nextWorkers, nextEditingId } = applyWorkerToList(localWorkers, workerData);
    setLocalWorkers(nextWorkers);
    setEditingId(nextEditingId);
    setSaveFeedback(wasEditing ? `Ficha actualizada: ${workerData.name}` : `Trabajador creado: ${workerData.name}`);
  };

  const handleGlobalSave = () => {
    let nextWorkers = localWorkers;

    if (hasPendingFormChanges()) {
      const workerData = buildWorkerData();
      if (!workerData) return;

      nextWorkers = applyWorkerToList(localWorkers, workerData).nextWorkers;
    }

    setWorkers(nextWorkers);
    onClose();
  };

  const handleManagedWorkerChange = (workerId: string) => {
    if (workerId === NEW_WORKER_VALUE) {
      resetForm();
      return;
    }

    const selectedWorker = localWorkers.find((worker) => worker.id === workerId);
    if (selectedWorker) {
      loadWorkerIntoForm(selectedWorker);
    }
  };

  const handleDelete = (workerId: string) => {
    if (!window.confirm('Seguro que quieres eliminar este trabajador?')) {
      return;
    }

    const nextWorkers = localWorkers.filter((worker) => worker.id !== workerId);
    setLocalWorkers(nextWorkers);

    if (editingId === workerId) {
      resetForm();
    }
  };

  const generateSignatureFromText = (text: string): string | null => {
    if (!text.trim()) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = 400;
    canvas.height = 100;
    ctx.font = "60px 'Great Vibes', cursive";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    return canvas.toDataURL('image/png');
  };

  const handleGenerateTextSignature = (worker: Worker) => {
    const text = prompt('Introduce el texto para la firma (por ejemplo, nombre y apellidos):', worker.name);
    if (!text) return;

    const signature = generateSignatureFromText(text);
    if (!signature) return;

    setLocalWorkers((prevWorkers) =>
      prevWorkers.map((currentWorker) =>
        currentWorker.id === worker.id ? { ...currentWorker, signature } : currentWorker
      )
    );
  };

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>, workerId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target?.result as string;
      setLocalWorkers((prevWorkers) =>
        prevWorkers.map((worker) => (worker.id === workerId ? { ...worker, signature: base64 } : worker))
      );
    };

    reader.readAsDataURL(file);

    if (event.target) {
      event.target.value = '';
    }
  };

  const handleRemoveSignature = (workerId: string) => {
    setLocalWorkers((prevWorkers) =>
      prevWorkers.map((worker) => {
        if (worker.id !== workerId) return worker;
        const { signature, ...rest } = worker;
        return rest;
      })
    );
  };

  if (!isOpen) return null;

  const inputStyles =
    'mt-1 block w-full border border-gray-600 bg-agoin-darker rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-agoin-teal focus:border-agoin-teal text-agoin-light';
  const selectStyles =
    'mt-1 block w-full border border-gray-600 bg-agoin-darker rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-agoin-teal focus:border-agoin-teal text-agoin-light';
  const timeInputStyles =
    'mt-1 block w-full border border-gray-600 bg-agoin-darker rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-agoin-teal focus:border-agoin-teal text-agoin-light text-sm';
  const selectedWorker = editingId ? localWorkers.find((worker) => worker.id === editingId) ?? null : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-agoin-dark rounded-lg shadow-xl p-6 w-full max-w-5xl border border-gray-700 max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <h2 className="text-2xl font-bold mb-4 text-agoin-light">Gestionar trabajadores</h2>

        <div className="rounded-xl border border-gray-700 bg-agoin-darker/50 p-4 mb-4">
          {saveFeedback && (
            <div className="mb-4 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm font-medium text-green-200">
              {saveFeedback}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Trabajador a gestionar</label>
              <select
                value={editingId ?? NEW_WORKER_VALUE}
                onChange={(e) => handleManagedWorkerChange(e.target.value)}
                className={selectStyles}
              >
                <option value={NEW_WORKER_VALUE}>Nuevo trabajador</option>
                {localWorkers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} - {worker.signature ? 'Con firma' : 'Sin firma'}
                  </option>
                ))}
              </select>
            </div>

            <div className="xl:col-span-2">
              <label className="block text-sm font-medium text-gray-300">Nombre</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputStyles} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">DNI</label>
              <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} className={inputStyles} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Horas contrato</label>
              <input
                type="number"
                value={contractHours}
                onChange={(e) => setContractHours(parseInt(e.target.value, 10) || 0)}
                className={inputStyles}
              />
            </div>

            <div className="xl:col-span-4">
              <p className="text-xs text-gray-400 mb-3">
                Opcional. Si se deja en blanco, se usa el horario estandar de la empresa. Para jornada continua, marca la opcion y rellena entrada y salida.
              </p>
              <label className="flex items-center gap-2 text-sm text-gray-300 mb-3">
                <input
                  type="checkbox"
                  checked={hasBreak}
                  onChange={(e) => {
                    const nextHasBreak = e.target.checked;
                    setHasBreak(nextHasBreak);
                    if (!nextHasBreak) {
                      setStandardStop('');
                      setStandardComeback('');
                    }
                  }}
                  className="h-4 w-4 rounded border-gray-600 bg-agoin-darker text-agoin-green focus:ring-agoin-green"
                />
                Tiene parada y regreso
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Entrada</label>
                  <input
                    type="time"
                    value={standardEntry}
                    onChange={(e) => setStandardEntry(e.target.value)}
                    className={timeInputStyles}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Parada</label>
                  <input
                    type="time"
                    value={standardStop}
                    onChange={(e) => setStandardStop(e.target.value)}
                    className={timeInputStyles}
                    disabled={!hasBreak}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Regreso</label>
                  <input
                    type="time"
                    value={standardComeback}
                    onChange={(e) => setStandardComeback(e.target.value)}
                    className={timeInputStyles}
                    disabled={!hasBreak}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300">Salida</label>
                  <input
                    type="time"
                    value={standardExit}
                    onChange={(e) => setStandardExit(e.target.value)}
                    className={timeInputStyles}
                  />
                </div>
              </div>
            </div>

            <div className="xl:col-span-1">
              <div className="flex flex-col gap-2 h-full justify-end">
                <button
                  onClick={handleSaveWorkerData}
                  className="px-4 py-2 bg-agoin-green text-white rounded-md hover:bg-opacity-90"
                >
                  {editingId ? 'Actualizar ficha' : 'Crear trabajador'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
                >
                  Nuevo / limpiar
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedWorker ? (
          <div className="rounded-xl border border-agoin-teal bg-agoin-darker/80 p-4">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-agoin-light text-base">{selectedWorker.name}</p>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-agoin-teal/20 text-agoin-teal border border-agoin-teal/40">
                    Seleccionado
                  </span>
                </div>

                <p className="text-sm text-gray-400 mt-1">
                  {selectedWorker.dni} · {selectedWorker.contractHours} horas · {selectedWorker.hasBreak === false ? 'Jornada continua' : 'Con pausa'}
                </p>

                <div
                  className={`mt-3 rounded-xl border p-3 ${
                    selectedWorker.signature ? 'border-green-500/40 bg-green-500/5' : 'border-amber-500/40 bg-amber-500/5'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">Firma seleccionada</p>
                      <p className="text-xs text-gray-400">
                        La firma que ira en el PDF de {selectedWorker.name}.
                      </p>
                    </div>

                    <span
                      className={`px-2 py-1 text-[11px] font-semibold rounded-full ${
                        selectedWorker.signature
                          ? 'bg-green-500/15 text-green-300 border border-green-500/30'
                          : 'bg-amber-500/15 text-amber-200 border border-amber-500/30'
                      }`}
                    >
                      {selectedWorker.signature ? 'Firma asignada' : 'Sin firma asignada'}
                    </span>
                  </div>

                  <div className="h-16 rounded-lg border border-gray-700 bg-white flex items-center justify-center p-2">
                    {selectedWorker.signature ? (
                      <img
                        src={selectedWorker.signature}
                        alt={`Firma de ${selectedWorker.name}`}
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-xs font-medium text-gray-500">
                        Todavia no hay ninguna firma seleccionada
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  ref={(element) => {
                    fileInputRefs.current[selectedWorker.id] = element;
                  }}
                  onChange={(e) => handleSignatureUpload(e, selectedWorker.id)}
                  className="hidden"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  <button
                    onClick={() => fileInputRefs.current[selectedWorker.id]?.click()}
                    className="w-full px-3 py-2 text-sm font-medium text-white bg-agoin-teal rounded-md hover:bg-opacity-90"
                  >
                    Subir firma
                  </button>

                  <button
                    onClick={() => handleGenerateTextSignature(selectedWorker)}
                    className="w-full px-3 py-2 text-sm font-medium text-white bg-agoin-accent rounded-md hover:bg-agoin-accent-hover"
                  >
                    Generar firma en texto
                  </button>

                  {selectedWorker.signature && (
                    <button
                      onClick={() => handleRemoveSignature(selectedWorker.id)}
                      className="w-full px-3 py-2 text-sm font-medium text-white bg-gray-500 rounded-md hover:bg-gray-600"
                    >
                      Quitar firma
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(selectedWorker.id)}
                    className="w-full px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                  >
                    Eliminar trabajador
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-700 p-6 text-center text-sm text-gray-400">
            {localWorkers.length === 0
              ? 'No hay trabajadores dados de alta todavia.'
              : 'Selecciona un trabajador en "Trabajador a gestionar" o crea uno nuevo para gestionar su firma.'}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
            Cerrar
          </button>
          <button onClick={handleGlobalSave} className="px-4 py-2 bg-agoin-green text-white rounded-md hover:bg-opacity-90">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerManager;
