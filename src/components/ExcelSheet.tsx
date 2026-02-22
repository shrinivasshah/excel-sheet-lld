import type { ReactNode } from 'react';
import Toolbar from './Toolbar';
import Grid from './Grid';
import { ExcelProvider } from '../context/ExcelContext';
import './ExcelSheet.css';

interface ExcelSheetProps {
    children: ReactNode;
}

function ExcelSheetWrapper({ children }: ExcelSheetProps) {
    return (
        <ExcelProvider>
            <div className="excel-sheet">
                {children}
            </div>
        </ExcelProvider>
    );
};

ExcelSheetWrapper.Toolbar = Toolbar;
ExcelSheetWrapper.Grid = Grid;

export default ExcelSheetWrapper;
