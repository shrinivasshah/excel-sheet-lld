import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useSignal, Signal, signal } from '@preact/signals-react';
import type { CellData } from '../types';

interface ExcelContextType {
    cellSignalsMap: Signal<Record<string, Signal<CellData>>>;
    activeCellSignal: Signal<string | null>;
    rowsSignal: Signal<number>;
    colsSignal: Signal<number>;
    updateCell: (id: string, newValue: string) => void;
    getCellSignal: (id: string) => Signal<CellData>;
}

const ExcelContext = createContext<ExcelContextType | undefined>(undefined);

export function ExcelProvider({ children }: { children: ReactNode }) {
    const cellSignalsMap = useSignal<Record<string, Signal<CellData>>>({});
    const activeCellSignal = useSignal<string | null>(null);
    const rowsSignal = useSignal(20);
    const colsSignal = useSignal(10);

    const getCellSignal = (id: string) => {
        if (!cellSignalsMap.value[id]) {
            
            const newSignal = signal<CellData>({ id, value: '' });
            cellSignalsMap.value = { ...cellSignalsMap.value, [id]: newSignal };
        }
        return cellSignalsMap.value[id];
    };

    const updateCell = (id: string, newValue: string) => {
        const cellSignal = getCellSignal(id);
        cellSignal.value = { ...cellSignal.value, value: newValue };
    };

    return (
        <ExcelContext.Provider value={{
            cellSignalsMap,
            activeCellSignal,
            rowsSignal,
            colsSignal,
            updateCell,
            getCellSignal
        }}>
            {children}
        </ExcelContext.Provider>
    );
}

export function useExcelContext() {
    const context = useContext(ExcelContext);
    if (!context) {
        throw new Error('useExcelContext must be used within an ExcelProvider');
    }
    return context;
}
