import React from 'react';
import type { Worker } from '../types';

interface ControlsProps {
  workers: Worker[];
  selectedWorkerId: string | null;
  setSelectedWorkerId: (id: string) => void;
  selectedDate: { month: number; year: number };
  setSelectedDate: (date: { month: number; year: number }) => void;
  onGenerate: () => void;
  onClear: () => void;
  onDownloadPdf: () => void;
  isDownloadingPdf: boolean;
  onManageWorkers: () => void;
  onAddWorker: () => void;
  includeSignature: boolean;
  onIncludeSignatureChange: (include: boolean) => void;
}

const Controls: React.FC<ControlsProps> = ({
  workers,
  selectedWorkerId,
  setSelectedWorkerId,
  selectedDate,
  setSelectedDate,
  onGenerate,
  onClear,
  onDownloadPdf,
  isDownloadingPdf,
  onManageWorkers,
  onAddWorker,
  includeSignature,
  onIncludeSignatureChange
}) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  const inputStyles = "mt-1 block w-full pl-3 pr-10 py-2 text-base bg-agoin-darker border-agoin-dark text-agoin-light focus:outline-none focus:ring-agoin-teal focus:border-agoin-teal sm:text-sm rounded-md";

  return (
    <div className="p-4 bg-agoin-dark my-4 rounded-lg no-print">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        {/* Worker Selection */}
        <div className="lg:col-span-1">
          <label htmlFor="worker-select" className="block text-sm font-medium text-agoin-light/90">Trabajador</label>
          <div className="flex">
            <select
              id="worker-select"
              value={selectedWorkerId ?? ''}
              onChange={(e) => setSelectedWorkerId(e.target.value)}
              className={inputStyles}
            >
              <option value="" disabled>Seleccione un trabajador</option>
              {workers.map((worker) => (
                <option key={worker.id} value={worker.id}>{worker.name}</option>
              ))}
            </select>
            <button onClick={onManageWorkers} className="ml-2 mt-1 px-3 py-2 bg-agoin-teal text-white rounded-md hover:bg-opacity-90 text-sm flex-shrink-0 transition-colors">Gestionar</button>
            <button onClick={onAddWorker} className="ml-2 mt-1 px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm flex-shrink-0 transition-colors" title="Añadir nuevo trabajador">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
            </button>
          </div>
        </div>
        
        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-2 lg:col-span-1">
          <div>
            <label htmlFor="month-select" className="block text-sm font-medium text-agoin-light/90">Mes</label>
            <select
              id="month-select"
              value={selectedDate.month}
              onChange={(e) => setSelectedDate({ ...selectedDate, month: parseInt(e.target.value) })}
              className={inputStyles}
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year-select" className="block text-sm font-medium text-agoin-light/90">Año</label>
            <select
              id="year-select"
              value={selectedDate.year}
              onChange={(e) => setSelectedDate({ ...selectedDate, year: parseInt(e.target.value) })}
              className={inputStyles}
            >
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-2 md:col-span-2 lg:col-span-1">
            <div className='flex gap-2 flex-grow'>

              <button onClick={onClear} className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 transition">Limpiar</button>
            </div>
          <div className="flex items-center justify-center sm:justify-end gap-2 sm:border-l border-gray-700 sm:ml-2 sm:pl-2 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-700">
            <button 
                onClick={onDownloadPdf} 
                disabled={isDownloadingPdf}
                className="px-4 py-2 bg-agoin-green text-white rounded-md hover:bg-opacity-90 transition disabled:bg-agoin-green/50 disabled:cursor-not-allowed"
            >
              {isDownloadingPdf ? 'Generando...' : 'PDF'}
            </button>
            <div className="flex items-center">
              <input 
                id="include-signature" 
                type="checkbox" 
                checked={includeSignature} 
                onChange={e => onIncludeSignatureChange(e.target.checked)} 
                className="h-4 w-4 text-agoin-green rounded border-gray-600 bg-agoin-dark focus:ring-agoin-green"
              />
              <label htmlFor="include-signature" className="ml-2 text-sm text-agoin-light/90 whitespace-nowrap">Firma</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Controls;