import React from 'react';
import { TableHead, TableCell, TableSortLabel } from '@material-ui/core';
import { DataViewSelectionMode, IDataViewColumn } from './declarations';
import { IDataRecord } from '../dataInterfaces';
import RowCheckbox from './RowCheckbox';
import { TableHeaderCell, TableHeadRow } from './TableParts';

export interface TableHeaderProps {
    selectionMode: DataViewSelectionMode;
    totalRows: number;
    selectedRows: number;
    onSelectAllClick?: () => void;
    columns: IDataViewColumn<IDataRecord, any>[];
    sortKey?: string
}

const TableHeader = (props: TableHeaderProps) => {
    const onSortLabelClick = (column: IDataViewColumn<IDataRecord, any>) => {

    };

    return (
        <TableHead>
            <TableHeadRow>
                {props.selectionMode && props.selectionMode !== "none" && (
                    <TableHeaderCell padding="checkbox">
                        <RowCheckbox
                            indeterminate={props.selectedRows > 0 && props.selectedRows < props.totalRows}
                            checked={props.totalRows > 0 && props.selectedRows === props.totalRows}
                            disabled={props.selectionMode === "single" || props.totalRows === 0}
                            onChange={props.onSelectAllClick}
                        />
                    </TableHeaderCell>
                )}
                {props.columns.map(column => (
                    <TableHeaderCell key={column.id} align={column.align}>
                        {column.sortKey && column.sortKey.length
                            ? <TableSortLabel
                                hideSortIcon
                                active={props.sortKey === column.sortKey}
                                onClick={() => onSortLabelClick(column)}
                            >
                                <>{column.name}</>
                            </TableSortLabel>
                            : <>{column.name}</>
                        }
                    </TableHeaderCell>
                ))}
            </TableHeadRow>
        </TableHead>
    )
}

export default TableHeader;