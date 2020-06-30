import React, { useState, useEffect } from 'react';
import { LinearProgress, Table, TableBody, TableCell, makeStyles } from '@material-ui/core';

import { IDataRecord, IDataSourceQueryStatus, IDataConnector } from '../dataInterfaces';
import { IColumnFiltersData, IDataViewColumn, DataSourceState, DataViewSelectionMode } from './declarations';

import {DataViewStyles} from './styles';

import ViewHeader from './ViewHeader';
import ActiveFiltersDisplay from './ActiveFiltersDisplay';
import SearchQueryInput from './SearchQueryInput';
import Toolbar from './Toolbar';
import QueryProgress from './QueryProgress';
import TableHeader from './TableHeader';
import RowCheckbox from './RowCheckbox';
import { TableContentCell, TableRow } from './TableParts';

interface DataViewProps<TRecord extends IDataRecord, TFilter, TOrderBy> {
    columns: IDataViewColumn<TRecord, TFilter>[];
    selectionMode?: DataViewSelectionMode;
    dataSource: IDataConnector<TRecord, TFilter, TOrderBy>;
}

const useDataViewStyles = makeStyles(DataViewStyles);

function DataView<TRecord extends IDataRecord, TFilter, TOrderBy>(props: DataViewProps<TRecord, TFilter, TOrderBy>) {
    const [columnFiltersData, setColumnFiltersData] = useState<IColumnFiltersData>({});
    const [dataSourceState, setdataSourceState] = useState<DataSourceState>("idle");
    const [pageData, setPageData] = useState<TRecord[]>([]);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [searchPhrase, setSearchPhrase] = useState<string>("");
    const [isFresh, setIsFresh] = useState<boolean>(true);
    const activeFiltersCount = Object.keys(columnFiltersData).length;

    const classes = useDataViewStyles();

    var isUnmounted: boolean = false;

    useEffect(() => {
        if (isFresh) {
            setIsFresh(false);
            updateData();
        }
    })

    const getFilter = (): TFilter | undefined => {
        return undefined;
    }

    const onDataUpdateProgress = (status: IDataSourceQueryStatus) => {

    }

    const updateData = () => {
        if (dataSourceState !== "idle") {
            return;
        }

        setdataSourceState("busy");
        getPageData();
        //this.setState({ dataSourceState: "busy", dataSourceLastOperationSuccess: false, selectedRows: [] }, this.getPageData);
    }

    const getPageData = async () => {
        const filter = props.dataSource.makeFilter(getFilter(), searchPhrase);
        const countResult = await props.dataSource.count(filter ? filter : undefined, onDataUpdateProgress);

        if (isUnmounted) {
            return;
        }

        if (!countResult.isSuccessful) {
            setPageData([]);
            setdataSourceState("idle");
            //this.setState({ pageData: [], isDataLoaded: true, dataSourceState: "idle", dataSourceLastOperationSuccess: false });

        } else {

            /*if (countResult.count !== this.state.totalRecords) {
                this.setState({ totalRecords: countResult.count }, () => {
                    this.updateTotalPagesCount();
                });
            }*/
            /*
                        let orderBy: string | undefined = this.props.defaultSortDirection && this.props.defaultSortKey
                            ? this.props.defaultSortKey + "_" + this.props.defaultSortDirection.toUpperCase()
                            : undefined;
            
                        if (this.state.sortKey && this.state.sortDirection) {
                            orderBy = this.state.sortKey + "_" + this.state.sortDirection.toUpperCase();
                        }
            */
            if (countResult.count > 0) {
                var result = await props.dataSource.getPage(filter ? filter : undefined, undefined, undefined, 25, undefined, onDataUpdateProgress);

                if (isUnmounted) {
                    return;
                }

                setPageData(result.data);
                setdataSourceState("idle");
                //this.setState({ pageData: result.data, isDataLoaded: true, dataSourceState: "idle", dataSourceLastOperationSuccess: result.isSuccessful !== true });
            } else {
                //this.setState({ pageData: [], isDataLoaded: true, dataSourceState: "idle", dataSourceLastOperationSuccess: true });
            }
        }
    }

    return (
        <div className={classes.container}>
            <ViewHeader>
                {activeFiltersCount > 0
                    ? <ActiveFiltersDisplay
                        viewColumns={props.columns}
                        columnFilters={columnFiltersData}
                        onClearFilter={() => { }}
                    />
                    : <SearchQueryInput
                        disabled={false}
                        onChange={() => { }}
                    />
                }
                <Toolbar
                    disableFilter
                    disableSelectColumns
                    onRefreshClick={() => { updateData() }}
                />
            </ViewHeader>

            <QueryProgress state={dataSourceState} />

            <Table>
                <TableHeader
                    columns={props.columns}
                    selectedRows={0}
                    totalRows={0}
                    selectionMode={props.selectionMode ? props.selectionMode : "none"}
                />
                <TableBody>
                    {pageData.map((item, index) => {
                        const isRowSelected: boolean = selectedRows.includes(index);
                        return (
                            <TableRow key={item.id}>
                                {props.selectionMode && props.selectionMode !== "none" && (
                                    <TableContentCell padding="checkbox">
                                        <RowCheckbox checked={isRowSelected} onChange={() => { }} />
                                    </TableContentCell>
                                )}
                                {props.columns.map(column => (
                                    <TableContentCell key={column.name} align={column.align}>{column.render(item)}</TableContentCell>
                                ))}
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>
        </div>
    )
}

export default DataView;