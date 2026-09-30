

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import Controls from './components/Controls';
import LogTable from './components/LogTable';
import CalendarView from './components/CalendarView';
import WorkerManager from './components/WorkerManager';
import ReportInfo from './components/ReportInfo';
import useLocalStorage from './hooks/useLocalStorage';
import type { Worker, LogEntry } from './types';
import { STANDARD_TIMES, AGOIN_LOGO_BASE64, isWorkDay } from './constants';

declare const html2canvas: any;
declare const jspdf: any;

const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

const App: React.FC = () => {
    const [workers, setWorkers] = useLocalStorage<Worker[]>('agoin-workers', []);
    const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
    const [editingWorkerId, setEditingWorkerId] = useState<string | null>(null);
    
    const today = new Date();
    const [selectedDate, setSelectedDate] = useState({ month: today.getMonth(), year: today.getFullYear() });
    
    const [logData, setLogData] = useState<LogEntry[]>([]);
    const [isWorkerManagerOpen, setIsWorkerManagerOpen] = useState(false);
    const [includeSignature, setIncludeSignature] = useState(true);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);


    const selectedWorker = useMemo(() => workers.find(w => w.id === selectedWorkerId), [workers, selectedWorkerId]);
    const selectedWorkerHasBreak = selectedWorker?.hasBreak !== false;

    const calculateHours = useCallback((entry: Partial<LogEntry>): number => {
        const entryTime = timeToMinutes(entry.entry || '');
        const stopTime = timeToMinutes(entry.stop || '');
        const comebackTime = timeToMinutes(entry.comeback || '');
        const exitTime = timeToMinutes(entry.exit || '');

        let ordinaryHours = 0;
        const hasBreakWindow = Boolean(entry.stop && entry.comeback);

        if (hasBreakWindow && stopTime > entryTime && exitTime > comebackTime) {
            const morningMinutes = stopTime - entryTime;
            const afternoonMinutes = exitTime - comebackTime;
            ordinaryHours = (morningMinutes + afternoonMinutes) / 60;
        } else if (!hasBreakWindow && exitTime > entryTime) {
            ordinaryHours = (exitTime - entryTime) / 60;
        }
        return Math.round(ordinaryHours * 100) / 100;
    }, []);

    const effectiveStandardTimes = useMemo(() => {
        const hasCustomWorkerSchedule = Boolean(selectedWorker && (
            selectedWorker.standardEntry !== undefined ||
            selectedWorker.standardStop !== undefined ||
            selectedWorker.standardComeback !== undefined ||
            selectedWorker.standardExit !== undefined ||
            selectedWorker.hasBreak === false
        ));

        if (!selectedWorker || !hasCustomWorkerSchedule) {
            return STANDARD_TIMES;
        }

        return {
            entry: selectedWorker.standardEntry ?? STANDARD_TIMES.entry,
            stop: selectedWorker.hasBreak === false ? '' : (selectedWorker.standardStop ?? STANDARD_TIMES.stop),
            comeback: selectedWorker.hasBreak === false ? '' : (selectedWorker.standardComeback ?? STANDARD_TIMES.comeback),
            exit: selectedWorker.standardExit ?? STANDARD_TIMES.exit,
        };
    }, [selectedWorker]);

    const months = useMemo(() => [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ], []);

    const generateLog = useCallback(() => {
        const daysInMonth = new Date(selectedDate.year, selectedDate.month + 1, 0).getDate();
        
        const now = new Date();
        const currentDay = now.getDate();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

        const newLogData: LogEntry[] = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(Date.UTC(selectedDate.year, selectedDate.month, i));
            const workDay = isWorkDay(date);
            
            let entryData: LogEntry = {
                day: i,
                entry: '',
                stop: '',
                comeback: '',
                exit: '',
                ordinaryHours: 0,
                extraHours: 0,
                signature: '',
                enabled: workDay,
                entryTick: false,
                stopTick: false,
                comebackTick: false,
                exitTick: false,
            };

            if (!workDay) {
                newLogData.push(entryData);
                continue;
            }

            const isPastYear = selectedDate.year < currentYear;
            const isPastMonth = selectedDate.year === currentYear && selectedDate.month < currentMonth;
            const isCurrentMonthAndYear = selectedDate.year === currentYear && selectedDate.month === currentMonth;

            // Fully fill past days
            if (isPastYear || isPastMonth || (isCurrentMonthAndYear && i < currentDay)) {
                 const filledEntry = {
                    ...entryData,
                    ...effectiveStandardTimes,
                    entryTick: Boolean(effectiveStandardTimes.entry),
                    stopTick: Boolean(effectiveStandardTimes.stop),
                    comebackTick: Boolean(effectiveStandardTimes.comeback),
                    exitTick: Boolean(effectiveStandardTimes.exit),
                };
                entryData = {
                    ...filledEntry,
                    ordinaryHours: calculateHours(filledEntry),
                };
            } 
            // Partially fill today based on current time
            else if (isCurrentMonthAndYear && i === currentDay) {
                const entryTime = timeToMinutes(effectiveStandardTimes.entry);
                const stopTime = timeToMinutes(effectiveStandardTimes.stop);
                const comebackTime = timeToMinutes(effectiveStandardTimes.comeback);
                const exitTime = timeToMinutes(effectiveStandardTimes.exit);

                const entryTick = Boolean(effectiveStandardTimes.entry) && currentTimeInMinutes >= entryTime;
                const stopTick = Boolean(effectiveStandardTimes.stop) && currentTimeInMinutes >= stopTime;
                const comebackTick = Boolean(effectiveStandardTimes.comeback) && currentTimeInMinutes >= comebackTime;
                const exitTick = Boolean(effectiveStandardTimes.exit) && currentTimeInMinutes >= exitTime;
                
                const partiallyFilledEntry = {
                    ...entryData,
                    entry: entryTick ? effectiveStandardTimes.entry : '',
                    stop: stopTick ? effectiveStandardTimes.stop : '',
                    comeback: comebackTick ? effectiveStandardTimes.comeback : '',
                    exit: exitTick ? effectiveStandardTimes.exit : '',
                    entryTick,
                    stopTick,
                    comebackTick,
                    exitTick,
                };

                entryData = {
                    ...partiallyFilledEntry,
                    ordinaryHours: calculateHours(partiallyFilledEntry),
                }
            }
            
            newLogData.push(entryData);
        }
        setLogData(newLogData);

    }, [selectedDate, effectiveStandardTimes, calculateHours]);


    useEffect(() => {
        // Auto-select first worker if one exists and none is selected
        if (!selectedWorkerId && workers.length > 0) {
            setSelectedWorkerId(workers[0].id);
        }
        // If the selected worker is deleted, select the first one or null
        if (selectedWorkerId && !workers.find(w => w.id === selectedWorkerId)) {
            setSelectedWorkerId(workers.length > 0 ? workers[0].id : null);
        }
    }, [workers, selectedWorkerId]);

    useEffect(() => {
        generateLog();
    }, [generateLog, selectedWorkerId]);

    const handleTimeChange = (day: number, field: 'entry' | 'stop' | 'comeback' | 'exit', value: string) => {
        setLogData(logData.map((entry) => {
            if (entry.day === day) {
                const updatedEntry: LogEntry = { ...entry, [field]: value };
                const tickField = `${field}Tick` as const;
                updatedEntry[tickField] = value === effectiveStandardTimes[field];
                updatedEntry.ordinaryHours = calculateHours(updatedEntry);
                return updatedEntry;
            }
            return entry;
        }));
    };
    
    const handleTickChange = (day: number, field: 'entry' | 'stop' | 'comeback' | 'exit', isChecked: boolean) => {
        setLogData(logData.map(entry => {
            if (entry.day === day) {
                const updatedEntry: LogEntry = { ...entry, [field]: isChecked ? effectiveStandardTimes[field] : '' };
                const tickField = `${field}Tick` as const;
                updatedEntry[tickField] = isChecked;
                updatedEntry.ordinaryHours = calculateHours(updatedEntry);
                return updatedEntry;
            }
            return entry;
        }));
    };

    const handleExtraHoursChange = (day: number, value: string) => {
        const hours = parseFloat(value);
        setLogData(logData.map(entry => entry.day === day ? { ...entry, extraHours: isNaN(hours) ? 0 : hours } : entry));
    };
  
    const toggleDay = (day: number) => {
        setLogData(logData.map(entry => {
            if (entry.day === day) {
                const newEnabledState = !entry.enabled;
                const newEntry: LogEntry = { ...entry, enabled: newEnabledState };

                if (!newEnabledState) { // Disabling
                    newEntry.entry = '';
                    newEntry.stop = '';
                    newEntry.comeback = '';
                    newEntry.exit = '';
                    newEntry.ordinaryHours = 0;
                    newEntry.extraHours = 0;
                    newEntry.entryTick = false;
                    newEntry.stopTick = false;
                    newEntry.comebackTick = false;
                    newEntry.exitTick = false;
                } else { // Enabling
                    const date = new Date(Date.UTC(selectedDate.year, selectedDate.month, day));
                    if (isWorkDay(date)) {
                        const filledEntry = {
                             ...newEntry,
                            ...effectiveStandardTimes,
                            entryTick: Boolean(effectiveStandardTimes.entry),
                            stopTick: Boolean(effectiveStandardTimes.stop),
                            comebackTick: Boolean(effectiveStandardTimes.comeback),
                            exitTick: Boolean(effectiveStandardTimes.exit),
                        };
                         Object.assign(newEntry, {
                            ...filledEntry,
                            ordinaryHours: calculateHours(filledEntry),
                        });
                    }
                }
                return newEntry;
            }
            return entry;
        }));
    }

    const clearLog = () => {
       const daysInMonth = new Date(selectedDate.year, selectedDate.month + 1, 0).getDate();
        const emptyLog = Array.from({ length: daysInMonth }, (_, i) => ({
            day: i + 1,
            entry: '',
            stop: '',
            comeback: '',
            exit: '',
            ordinaryHours: 0,
            extraHours: 0,
            signature: '',
            enabled: isWorkDay(new Date(Date.UTC(selectedDate.year, selectedDate.month, i + 1))),
            entryTick: false,
            stopTick: false,
            comebackTick: false,
            exitTick: false,
        }));
        setLogData(emptyLog);
    };
    
    const totalHours = useMemo(() => {
        return logData.reduce((total, entry) => {
             if (entry.enabled) {
                return total + entry.ordinaryHours + entry.extraHours;
            }
            return total;
        }, 0);
    }, [logData]);
    
    const handleDownloadPdf = async () => {
        if (!selectedWorker) {
            alert('Por favor, seleccione un trabajador para generar el PDF.');
            return;
        }
        if (!window.confirm(`Se va a generar el PDF para "${selectedWorker.name}".\n\n¿Continuar?`)) {
            return;
        }

        setIsDownloadingPdf(true);

        const input = document.getElementById('printable-area');
        if (!input) {
            console.error("Printable element not found.");
            setIsDownloadingPdf(false);
            return;
        }

        const originalClassName = input.className;
        input.className = 'print-render-container';

        try {
            await new Promise(resolve => setTimeout(resolve, 100));

            const canvas = await html2canvas(input, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = jspdf;
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const margin = 15;
            const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
            const pdfHeight = pdf.internal.pageSize.getHeight() - (margin * 2);
            
            const canvasAspectRatio = canvas.height / canvas.width;
            
            let finalPdfWidth = pdfWidth;
            let finalPdfHeight = pdfWidth * canvasAspectRatio;

            if (finalPdfHeight > pdfHeight) {
                finalPdfHeight = pdfHeight;
                finalPdfWidth = pdfHeight / canvasAspectRatio;
            }

            const x = margin + (pdfWidth - finalPdfWidth) / 2;
            const y = margin + (pdfHeight - finalPdfHeight) / 2;
            
            pdf.addImage(imgData, 'PNG', x, y, finalPdfWidth, finalPdfHeight);
            
            const fileName = `RegistroJornada_${selectedWorker.name.replace(/ /g, '_')}_${months[selectedDate.month]}_${selectedDate.year}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert('Ocurrió un error al generar el PDF. Revise la consola para más detalles.');
        } finally {
            input.className = originalClassName;
            setIsDownloadingPdf(false);
        }
    };
    
    const generationDate = new Date();
    const formattedGenerationDate = `En Toledo, a ${generationDate.getDate()} de ${months[generationDate.getMonth()]} de ${generationDate.getFullYear()}`;
      
    return (
        <div className="container mx-auto p-4">
            <div className="no-print">
                <Header />
                <Controls
                    workers={workers}
                    selectedWorkerId={selectedWorkerId}
                    setSelectedWorkerId={setSelectedWorkerId}
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    onGenerate={generateLog}
                    onClear={clearLog}
                    onDownloadPdf={handleDownloadPdf}
                    isDownloadingPdf={isDownloadingPdf}
                    onManageWorkers={() => {
                        setEditingWorkerId(selectedWorkerId);
                        setIsWorkerManagerOpen(true);
                    }}
                    onAddWorker={() => {
                        setEditingWorkerId(null);
                        setIsWorkerManagerOpen(true);
                    }}
                    includeSignature={includeSignature}
                    onIncludeSignatureChange={setIncludeSignature}
                />
            </div>

            {selectedWorkerId ? (
                 <div className="no-print">
                    <ReportInfo 
                        selectedWorker={selectedWorker}
                        selectedDate={selectedDate}
                        months={months}
                    />
                    <CalendarView 
                        logData={logData}
                        selectedDate={selectedDate}
                        showBreakFields={selectedWorkerHasBreak}
                        onToggleDay={toggleDay}
                        onTimeChange={handleTimeChange}
                        onTickChange={handleTickChange}
                        onExtraHoursChange={handleExtraHoursChange}
                    />
                </div>
            ) : (
                <div className="text-center p-10 bg-agoin-dark rounded-lg no-print">
                    <p className="text-gray-300">Por favor, seleccione o añada un trabajador para ver el registro de jornada.</p>
                </div>
            )}
            
            <WorkerManager
                workers={workers}
                setWorkers={setWorkers}
                isOpen={isWorkerManagerOpen}
                onClose={() => setIsWorkerManagerOpen(false)}
                initialSelectedWorkerId={editingWorkerId}
            />

            {/* --- PDF/PRINT SECTION --- */}
            <div 
                id="printable-area"
                className={'hidden print:block'}
            >
                {selectedWorker && (
                    <div className="p-4 flex flex-col min-h-[297mm]">
                        <div className="flex-grow">
                            <ReportInfo 
                                selectedWorker={selectedWorker}
                                selectedDate={selectedDate}
                                months={months}
                                isPdfMode={true}
                            />
                            <LogTable 
                                logData={logData} 
                                totalHours={totalHours}
                                showBreakFields={selectedWorkerHasBreak}
                                workerSignature={includeSignature ? selectedWorker.signature : undefined} 
                            />
                        </div>
                        <footer className="mt-auto pt-8 text-black">
                            <div className="text-center text-sm mb-6">
                                <p>{formattedGenerationDate}</p>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="w-1/4">
                                    <img src={AGOIN_LOGO_BASE64} alt="Logo AGOIN" className="h-10" />
                                </div>
                                <div className="w-3/4 flex justify-end gap-12 text-sm">
                                    <div className="text-center">
                                        {includeSignature && selectedWorker?.signature ? (
                                            <img src={selectedWorker.signature} alt="Firma del trabajador" className="h-14 w-32 object-contain mx-auto" />
                                        ) : (
                                            <div className="h-14 w-32"></div>
                                        )}
                                        <p className="border-t border-gray-500 mt-2 pt-1">Firma Trabajador</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="h-14 w-32"></div>
                                        <p className="border-t border-gray-500 mt-2 pt-1">Firma Empresa</p>
                                    </div>
                                </div>
                            </div>
                        </footer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;
