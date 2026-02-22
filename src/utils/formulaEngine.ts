import type { GridData, CellData } from '../types';
import { Signal } from '@preact/signals-react';


export const evaluateFormula = (
    formula: string,
    gridData: GridData | Record<string, Signal<CellData>>,
    visitedCells: Set<string> = new Set()
): string => {
    
    if (!formula.startsWith('=')) {
        return formula;
    }

    
    let expression = formula.substring(1).trim();

    
    
    const cellRefRegex = /[A-Z]+[0-9]+/g;

    
    expression = expression.replace(cellRefRegex, (match) => {
        
        if (visitedCells.has(match)) {
            throw new Error('#REF!');
        }

        
        const newVisited = new Set(visitedCells);
        newVisited.add(match);

        
        const referencedData = gridData[match];

        
        let cellValue = '';
        if (referencedData) {
            if ('value' in referencedData && typeof referencedData.value === 'object' && referencedData.value !== null && 'value' in referencedData.value) {
                
                
                cellValue = (referencedData as Signal<CellData>).value.value;
            } else if ('value' in referencedData) {
                
                cellValue = (referencedData as CellData).value;
            }
        }

        
        if (!cellValue) {
            return '0';
        }

        let refValue = cellValue;

        
        if (refValue.startsWith('=')) {
            try {
                refValue = evaluateFormula(refValue, gridData, newVisited);
            } catch (e) {
                
                const errMatch = String(e).match(/(#[A-Z!]+)/);
                return errMatch ? errMatch[1] : '#ERROR!';
            }
        }

        
        if (isNaN(Number(refValue))) {
            return `"${refValue}"`;
        }

        return refValue;
    });

    
    try {
        if (expression.includes('#REF!') || expression.includes('#ERROR!')) {
            return expression.includes('#REF!') ? '#REF!' : '#ERROR!';
        }

        
        if (/^"[^"]*"$/.test(expression)) {
            return expression.replace(/"/g, '');
        }

        const result = new Function(`return ${expression}`)();

        if (typeof result === 'number') {
            if (!Number.isInteger(result)) {
                return parseFloat(result.toFixed(4)).toString();
            }
            return result.toString();
        }

        return String(result);
    } catch (e) {
        return '#ERROR!';
    }
};
