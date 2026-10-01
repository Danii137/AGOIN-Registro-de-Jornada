import React from 'react';
import type { Worker } from '../types';
import { BRAND } from '../brand';

interface ReportInfoProps {
  selectedWorker: Worker | undefined;
  selectedDate: { month: number; year: number };
  months: string[];
  className?: string;
  isPdfMode?: boolean;
}

const ReportInfo: React.FC<ReportInfoProps> = ({ selectedWorker, selectedDate, months, className = '', isPdfMode = false }) => {
  const infoBoxStyles = isPdfMode
    ? "border border-gray-400 p-2 bg-white text-black"
    : "border border-gray-700 p-2 bg-agoin-dark";
  
  const containerStyles = isPdfMode 
    ? "" // Let the parent control styling for PDF
    : `p-4 bg-agoin-dark my-4 rounded-lg border border-gray-700 text-agoin-light ${className}`;

  return (
    <div className={containerStyles}>
       {isPdfMode && (
         <div className="text-center mb-4">
              <h1 className="text-2xl font-bold text-black tracking-wider uppercase">
                  Registro de Jornada Laboral
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                  Registro elaborado de acuerdo a lo establecido en el Art. 12.5 y 34 del Estatuto de los Trabajadores
              </p>
          </div>
       )}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-sm ${isPdfMode ? '!grid-cols-2 !gap-2' : ''}`}>
        <div className={infoBoxStyles}><strong>Empresa:</strong> {BRAND.name}</div>
        <div className={infoBoxStyles}><strong>CIF:</strong> {BRAND.cif}</div>
        <div className={infoBoxStyles}><strong>Trabajador:</strong> {selectedWorker?.name ?? 'N/A'}</div>
        <div className={infoBoxStyles}><strong>DNI:</strong> {selectedWorker?.dni ?? 'N/A'}</div>
        <div className={infoBoxStyles}><strong>Nº horas según contrato:</strong> {selectedWorker?.contractHours ?? 'N/A'}</div>
        <div className={infoBoxStyles}><strong>Mes:</strong> {months[selectedDate.month]} de {selectedDate.year}</div>
      </div>
    </div>
  );
};

export default ReportInfo;