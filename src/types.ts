export interface CellData {
    id: string; 
    value: string; 
}

export type GridData = Record<string, CellData>; 
