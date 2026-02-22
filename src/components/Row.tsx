import { MemoizedCell } from './Cell';
import './Row.css';

interface RowProps {
    rowIndex: number;
    cols: number;
}

const getColName = (n: number) => {
    let name = '';
    let num = n;
    while (num >= 0) {
        name = String.fromCharCode((num % 26) + 65) + name;
        num = Math.floor(num / 26) - 1;
    }
    return name;
};

export default function Row({ rowIndex, cols }: RowProps) {
    const cells = [];

    for (let c = 0; c < cols; c++) {
        const colName = getColName(c);
        const id = `${colName}${rowIndex + 1}`;

        cells.push(
            <MemoizedCell
                key={id}
                id={id}
            />
        );
    }

    return (
        <tr>
            <th className="excel-th-row">
                {rowIndex + 1}
            </th>
            {cells}
        </tr>
    );
};
