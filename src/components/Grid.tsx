import Row from './Row';
import { useExcelContext } from '../context/ExcelContext';
import './Grid.css';

const getColName = (n: number) => {
    let name = '';
    let num = n;
    while (num >= 0) {
        name = String.fromCharCode((num % 26) + 65) + name;
        num = Math.floor(num / 26) - 1;
    }
    return name;
};

export default function Grid() {
    const { rowsSignal, colsSignal } = useExcelContext();
    const rows = rowsSignal.value;
    const cols = colsSignal.value;


    const headerCols = [];
    for (let c = 0; c < cols; c++) {
        headerCols.push(
            <th key={`header-${c}`} className="excel-th-header">
                {getColName(c)}
            </th>
        );
    }

    const gridRows = [];
    for (let r = 0; r < rows; r++) {
        gridRows.push(
            <Row
                key={`row-${r}`}
                rowIndex={r}
                cols={cols}
            />
        );
    }

    return (
        <div className="excel-grid-wrapper">
            { }
            <table className="excel-table">
                <thead>
                    <tr>
                        <th className="excel-th-corner"></th>
                        {headerCols}
                    </tr>
                </thead>
                <tbody>
                    {gridRows}
                </tbody>
            </table>
        </div>
    );
};
