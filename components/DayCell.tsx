import React from 'react';
import type { LogEntry } from '../types';

interface DayCellProps {
  entry: LogEntry;
  selectedDate: { month: number; year: number };
  isWeekend: boolean;
  isHoliday: boolean;
  showBreakFields: boolean;
  isExpanded: boolean;
  onToggle: (day: number) => void;
  onTimeChange: (day: number, field: 'entry' | 'stop' | 'comeback' | 'exit', value: string) => void;
  onTickChange: (day: number, field: 'entry' | 'stop' | 'comeback' | 'exit', isChecked: boolean) => void;
  onExtraHoursChange: (day: number, value: string) => void;
  onExpand: (day: number) => void;
}

const DayCell: React.FC<DayCellProps> = ({ entry, selectedDate, isWeekend, isHoliday, showBreakFields, isExpanded, onToggle, onTimeChange, onTickChange, onExtraHoursChange, onExpand }) => {
  const { day, enabled } = entry;
  
  const bgColor = !enabled
    ? 'bg-agoin-darker'
    : 'bg-agoin-dark';

  const textColor = !enabled
    ? 'text-gray-500'
    : (isWeekend || isHoliday)
    ? 'text-agoin-teal'
    : 'text-agoin-light';
  
  const timeInputStyles = "w-16 border-gray-600 bg-agoin-darker rounded-sm shadow-sm p-0.5 text-xs text-center text-agoin-light";
  const tickInputStyles = "form-checkbox h-3 w-3 text-agoin-green bg-agoin-darker border-gray-600 rounded focus:ring-agoin-green";
  
  const weekDayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const date = new Date(Date.UTC(selectedDate.year, selectedDate.month, entry.day));
  const dayName = weekDayNames[date.getUTCDay()];


  return (
    <div className={`md:border border-gray-700/50 text-xs relative ${bgColor} ${textColor}`}>
      {/* Desktop view is always expanded */}
      <div className='hidden md:block p-2 min-h-[180px]'>
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-sm">{day}</span>
            <input 
                type="checkbox" 
                checked={enabled} 
                onChange={() => onToggle(day)} 
                className="form-checkbox h-4 w-4 text-agoin-green bg-agoin-darker border-gray-600 rounded focus:ring-agoin-green"
            />
          </div>
          {enabled && (
            <div className="space-y-1 text-gray-300">
                <div className="flex items-center justify-between">
                    <label className="text-xxs font-medium">Entrada:</label>
                    <div className="flex items-center gap-1.5">
                        <input type="time" value={entry.entry} onChange={(e) => onTimeChange(day, 'entry', e.target.value)} className={timeInputStyles} />
                        <input type="checkbox" checked={entry.entryTick} onChange={(e) => onTickChange(day, 'entry', e.target.checked)} className={tickInputStyles}/>
                    </div>
                </div>
                {showBreakFields && (
                    <>
                        <div className="flex items-center justify-between">
                            <label className="text-xxs font-medium">Parada:</label>
                            <div className="flex items-center gap-1.5">
                                <input type="time" value={entry.stop} onChange={(e) => onTimeChange(day, 'stop', e.target.value)} className={timeInputStyles} />
                                <input type="checkbox" checked={entry.stopTick} onChange={(e) => onTickChange(day, 'stop', e.target.checked)} className={tickInputStyles}/>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-xxs font-medium">Regreso:</label>
                            <div className="flex items-center gap-1.5">
                                <input type="time" value={entry.comeback} onChange={(e) => onTimeChange(day, 'comeback', e.target.value)} className={timeInputStyles} />
                                <input type="checkbox" checked={entry.comebackTick} onChange={(e) => onTickChange(day, 'comeback', e.target.checked)} className={tickInputStyles}/>
                            </div>
                        </div>
                    </>
                )}
                <div className="flex items-center justify-between">
                    <label className="text-xxs font-medium">Salida:</label>
                    <div className="flex items-center gap-1.5">
                        <input type="time" value={entry.exit} onChange={(e) => onTimeChange(day, 'exit', e.target.value)} className={timeInputStyles} />
                        <input type="checkbox" checked={entry.exitTick} onChange={(e) => onTickChange(day, 'exit', e.target.checked)} className={tickInputStyles}/>
                    </div>
                </div>
                 <div className="flex items-center justify-between mt-2 border-t border-gray-700 pt-1">
                    <label className="text-xs font-semibold text-agoin-light">H. Ord:</label>
                    <span className="font-semibold text-sm text-agoin-light">{entry.ordinaryHours.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-agoin-light">H. Extra:</label>
                    <input type="number" step="0.1" value={entry.extraHours > 0 ? entry.extraHours : ''} onChange={(e) => onExtraHoursChange(day, e.target.value)} className="w-12 border-gray-600 bg-agoin-darker rounded-sm shadow-sm p-0.5 text-xs text-center text-agoin-light" />
                </div>
            </div>
          )}
      </div>

      {/* Mobile view is collapsible */}
      <div className='md:hidden border-b border-gray-700'>
        <div className='flex items-center p-3 cursor-pointer' onClick={() => onExpand(day)}>
           <div className='flex items-center gap-3 flex-grow min-w-0'>
                <span className={`font-bold text-lg w-6 text-center ${textColor}`}>{day}</span>
                <span className='text-xs text-gray-400'>{dayName}</span>
                {enabled && (
                    <div className='flex-grow text-right truncate'>
                       <span className='text-xs text-agoin-light/80'> {entry.entry} - {entry.exit} </span>
                       <span className='font-bold text-sm ml-2'>{entry.ordinaryHours.toFixed(2)}h</span>
                    </div>
                )}
           </div>
           <div className='flex items-center gap-3 ml-4'>
                <input 
                    type="checkbox" 
                    checked={enabled} 
                    onChange={(e) => { e.stopPropagation(); onToggle(day); }} 
                    className="form-checkbox h-5 w-5 text-agoin-green bg-agoin-darker border-gray-600 rounded focus:ring-agoin-green"
                />
                <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
           </div>
        </div>
        {isExpanded && enabled && (
             <div className="p-3 bg-agoin-darker/50 space-y-2">
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Entrada:</label>
                    <div className="flex items-center gap-2">
                        <input type="time" value={entry.entry} onChange={(e) => onTimeChange(day, 'entry', e.target.value)} className={timeInputStyles.replace('w-16','w-24')} />
                        <input type="checkbox" checked={entry.entryTick} onChange={(e) => onTickChange(day, 'entry', e.target.checked)} className={tickInputStyles.replace('h-3 w-3','h-4 w-4')}/>
                    </div>
                </div>
                {showBreakFields && (
                    <>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Parada:</label>
                            <div className="flex items-center gap-2">
                                <input type="time" value={entry.stop} onChange={(e) => onTimeChange(day, 'stop', e.target.value)} className={timeInputStyles.replace('w-16','w-24')} />
                                <input type="checkbox" checked={entry.stopTick} onChange={(e) => onTickChange(day, 'stop', e.target.checked)} className={tickInputStyles.replace('h-3 w-3','h-4 w-4')}/>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Regreso:</label>
                            <div className="flex items-center gap-2">
                                <input type="time" value={entry.comeback} onChange={(e) => onTimeChange(day, 'comeback', e.target.value)} className={timeInputStyles.replace('w-16','w-24')} />
                                <input type="checkbox" checked={entry.comebackTick} onChange={(e) => onTickChange(day, 'comeback', e.target.checked)} className={tickInputStyles.replace('h-3 w-3','h-4 w-4')}/>
                            </div>
                        </div>
                    </>
                )}
                <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Salida:</label>
                    <div className="flex items-center gap-2">
                        <input type="time" value={entry.exit} onChange={(e) => onTimeChange(day, 'exit', e.target.value)} className={timeInputStyles.replace('w-16','w-24')} />
                        <input type="checkbox" checked={entry.exitTick} onChange={(e) => onTickChange(day, 'exit', e.target.checked)} className={tickInputStyles.replace('h-3 w-3','h-4 w-4')}/>
                    </div>
                </div>
                 <div className="flex items-center justify-between mt-3 border-t border-gray-700 pt-2">
                    <label className="text-sm font-semibold text-agoin-light">H. Ord:</label>
                    <span className="font-semibold text-base text-agoin-light">{entry.ordinaryHours.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-agoin-light">H. Extra:</label>
                    <input type="number" step="0.1" value={entry.extraHours > 0 ? entry.extraHours : ''} onChange={(e) => onExtraHoursChange(day, e.target.value)} className="w-16 border-gray-600 bg-agoin-darker rounded-sm shadow-sm p-1 text-sm text-center text-agoin-light" />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default DayCell;
