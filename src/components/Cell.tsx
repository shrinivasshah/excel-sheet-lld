import React, { useState, useEffect, useRef, memo, useMemo } from 'react';
import './Cell.css';
import { useExcelContext } from '../context/ExcelContext';
import { computed } from '@preact/signals-react';
import { evaluateFormula } from '../utils/formulaEngine';

interface CellProps {
    id: string;
}

export default function Cell({ id }: CellProps) {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const { getCellSignal, cellSignalsMap, activeCellSignal, updateCell } = useExcelContext();

    const cellSignal = getCellSignal(id);
    const isActive = activeCellSignal.value === id;



    const evaluatedValue = useMemo(() => computed(() => {
        return evaluateFormula(cellSignal.value.value, cellSignalsMap.value);
    }), [cellSignal, cellSignalsMap]).value;

    const value = cellSignal.value.value;

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    const handleBlur = () => {
        setEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setEditing(false);
        }
    };




    const displayValue = evaluatedValue !== undefined && evaluatedValue !== ''
        ? evaluatedValue
        : value;

    return (
        <td
            className={`excel-cell ${isActive ? 'active' : ''}`}
            onClick={() => {
                activeCellSignal.value = id;
                setEditing(true);
            }}
        >
            {editing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={(e) => updateCell(id, e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={handleKeyDown}
                    className="excel-cell-input"
                />
            ) : (
                <div className="excel-cell-view">
                    {displayValue}
                </div>
            )}
        </td>
    );
};

export const MemoizedCell = memo(Cell);
