
'use client';

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils";


const headers = ['A', 'B', 'C', 'D'];

interface SampleDataTableProps {
    onCellSelect: (cellValue: string) => void;
    data: {[key: string]: string | number}[];
}

interface Cell {
  row: number;
  col: number;
}

export default function SampleDataTable({ onCellSelect, data }: SampleDataTableProps) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [startCell, setStartCell] = useState<Cell | null>(null);
  const [endCell, setEndCell] = useState<Cell | null>(null);

  const getCellReference = (row: number, col: number) => {
    return `${headers[col]}${row + 1}`;
  };

  const handleMouseDown = (rowIndex: number, colIndex: number) => {
    setIsSelecting(true);
    setStartCell({ row: rowIndex, col: colIndex });
    setEndCell({ row: rowIndex, col: colIndex });
    onCellSelect(getCellReference(rowIndex, colIndex)); // For single click
  };

  const handleMouseOver = (rowIndex: number, colIndex: number) => {
    if (isSelecting) {
      setEndCell({ row: rowIndex, col: colIndex });
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && startCell && endCell) {
      const minRow = Math.min(startCell.row, endCell.row);
      const maxRow = Math.max(startCell.row, endCell.row);
      const minCol = Math.min(startCell.col, endCell.col);
      const maxCol = Math.max(startCell.col, endCell.col);

      const startRef = getCellReference(minRow, minCol);
      const endRef = getCellReference(maxRow, maxCol);

      if (startRef === endRef) {
        onCellSelect(startRef);
      } else {
        onCellSelect(`${startRef}:${endRef}`);
      }
    }
    setIsSelecting(false);
  };
  
  const isCellInRange = (rowIndex: number, colIndex: number) => {
      if (!isSelecting || !startCell || !endCell) return false;

      const minRow = Math.min(startCell.row, endCell.row);
      const maxRow = Math.max(startCell.row, endCell.row);
      const minCol = Math.min(startCell.col, endCell.col);
      const maxCol = Math.max(startCell.col, endCell.col);

      return rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol;
  }

  return (
     <div 
        className="border rounded-lg overflow-hidden"
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsSelecting(false)}
     >
        <Table>
            <TableHeader>
                <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="w-10 text-center font-bold text-muted-foreground">#</TableHead>
                    {headers.map(header => (
                         <TableHead key={header} className="w-auto text-center font-bold">
                            {header}
                         </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                    <TableCell className="text-center font-bold bg-muted text-muted-foreground">{rowIndex + 1}</TableCell>
                    {Object.values(row).map((cell, colIndex) => {
                        const isSelected = isCellInRange(rowIndex, colIndex);
                        return (
                            <TableCell 
                                key={colIndex} 
                                className={cn(
                                    "text-center cursor-cell select-none",
                                    isSelected && "bg-primary/20"
                                )}
                                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                                onMouseOver={() => handleMouseOver(rowIndex, colIndex)}
                            >
                                {cell}
                            </TableCell>
                        )
                    })}
                </TableRow>
                ))}
            </TableBody>
        </Table>
     </div>
  );
}
