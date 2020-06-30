import React from 'react';
import { Theme } from '@material-ui/core/styles';
import { withStyles, createStyles } from '@material-ui/styles';
import { TableCell, TableCellProps, TableRowProps, TableRow as MuiTableRow } from '@material-ui/core';

export const TableHeaderCell = withStyles((theme: Theme) => createStyles({
    root: {
        padding: theme.spacing(0, 1, 0, 0.5),
        whiteSpace: 'nowrap',
        borderBottom: 'none',
    }
}))((props: TableCellProps) => <TableCell {...props} />);

export const TableContentCell = withStyles((theme: Theme) => createStyles({
    root: {
        padding: theme.spacing(0, 1, 0, 0.5),
        borderBottom: 'none',
    }
}))((props: TableCellProps) => <TableCell {...props} />);

export const TableRow = withStyles((theme: Theme) => createStyles({
    root: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
        '&:last-child': {
            borderBottom: 'none',
        }
    }
}))((props: TableRowProps) => <MuiTableRow {...props} />);

export const TableHeadRow = withStyles((theme: Theme) => createStyles({
    root: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    }
}))((props: TableRowProps) => <MuiTableRow {...props} />);