import { useExcelContext } from '../context/ExcelContext';
import './Toolbar.css';

export default function Toolbar() {
    const { activeCellSignal, cellSignalsMap, updateCell, rowsSignal, colsSignal } = useExcelContext();
    const activeCell = activeCellSignal.value;
    const cellSignal = activeCell ? cellSignalsMap.value[activeCell] : null;
    const formulaValue = cellSignal ? cellSignal.value.value : '';

    const handleAddRow = () => {
        rowsSignal.value += 1;
    };

    const handleAddCol = () => {
        colsSignal.value += 1;
    };

    const handleFormulaChange = (value: string) => {
        if (activeCell) {
            updateCell(activeCell, value);
        }
    };

    return (
        <div className="container excel-toolbar">
            <div className="row toolbar-row-top">
                <div className="col-8">
                    <h4 className="excel-toolbar-title">React 2D Excel</h4>
                </div>
                <div className="col-4 excel-toolbar-actions">
                    <button className="small outline" onClick={handleAddRow}>+ Row</button>
                    <button className="small outline" onClick={handleAddCol}>+ Col</button>
                </div>
            </div>

            { }
            <div className="row toolbar-row-bottom">
                <div className="col-12 formula-bar">
                    <div className="cell-address-box">
                        {activeCell || ''}
                    </div>
                    <input
                        type="text"
                        value={formulaValue}
                        onChange={(e) => handleFormulaChange(e.target.value)}
                        placeholder="fx..."
                        className="formula-input"
                        disabled={!activeCell}
                    />
                </div>
            </div>
        </div>
    );
};
