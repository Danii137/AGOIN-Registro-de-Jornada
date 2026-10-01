import React from 'react';
import type { LogEntry } from '../types';

interface LogTableProps {
  logData: LogEntry[];
  totalHours: number;
  showBreakFields: boolean;
  workerSignature?: string;
}

const LogTable: React.FC<LogTableProps> = ({ logData, totalHours, showBreakFields, workerSignature }) => {
  const renderTime = (value: string, enabled: boolean) => {
    if (!enabled) return ' - ';
    return value || ' - ';
  };

  const totalLabelColSpan = showBreakFields ? 5 : 3;

  return (
    <div className="bg-white p-4 print-container">
      <div className="overflow-x-auto print:overflow-visible">
        <table className="min-w-full divide-y divide-gray-200 print-table text-black">
          <thead className="bg-agoin-green text-white">
            <tr>
              <th className="px-1 py-2 text-center text-xs font-medium uppercase tracking-wider">Dia</th>
              <th className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider">Entrada</th>
              {showBreakFields && <th className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider">Parada</th>}
              {showBreakFields && <th className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider">Regreso</th>}
              <th className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider">Salida</th>
              <th className="px-1 py-2 text-center text-xs font-medium uppercase tracking-wider">H. Ordinarias</th>
              <th className="px-1 py-2 text-center text-xs font-medium uppercase tracking-wider">H. Extra</th>
              <th className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wider">Firma</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logData.map((entry) => (
              <tr key={entry.day} className={!entry.enabled ? 'bg-gray-100 text-gray-400' : ''}>
                <td className="px-1 py-1 whitespace-nowrap text-center text-xs font-medium">{entry.day}</td>
                <td className="px-1 py-1 text-center text-xs">{renderTime(entry.entry, entry.enabled)}</td>
                {showBreakFields && <td className="px-1 py-1 text-center text-xs">{renderTime(entry.stop, entry.enabled)}</td>}
                {showBreakFields && <td className="px-1 py-1 text-center text-xs">{renderTime(entry.comeback, entry.enabled)}</td>}
                <td className="px-1 py-1 text-center text-xs">{renderTime(entry.exit, entry.enabled)}</td>
                <td className="px-1 py-1 whitespace-nowrap text-center text-xs">{entry.enabled ? entry.ordinaryHours.toFixed(2) : ' - '}</td>
                <td className="px-1 py-1 text-center text-xs">{entry.enabled ? (entry.extraHours > 0 ? entry.extraHours.toFixed(2) : '') : ' - '}</td>
                <td className="px-1 py-1">
                  {entry.enabled && workerSignature && (
                    <img src={workerSignature} alt="Firma" className="h-6 w-12 object-contain mx-auto" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={totalLabelColSpan} className="px-2 py-2 text-right font-bold text-xs border-t-2 border-gray-300">Total Horas Mes</td>
              <td className="px-1 py-2 text-center font-bold text-xs border-t-2 border-gray-300">{totalHours.toFixed(2)}</td>
              <td colSpan={2} className="border-t-2 border-gray-300"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default LogTable;
