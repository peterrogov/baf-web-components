import React, { Component, Fragment } from 'react';
import { ReactNode } from "react";
import { withStyles, Theme, createStyles, WithStyles } from '@material-ui/core/styles';
import { green, red, blue, pink } from '@material-ui/core/colors';
import classNames from 'classnames';
import ReactSelect from 'react-select';

import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Modal from '@material-ui/core/Modal';

import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/AddBox';
import EditIcon from '@material-ui/icons/Ballot';
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import FilterListIcon from '@material-ui/icons/FilterList';
import ClearIcon from '@material-ui/icons/Clear';

import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import NextPageIcon from '@material-ui/icons/ChevronRight';
import PrevPageIcon from '@material-ui/icons/ChevronLeft';

//import { IAppContext, AppContext } from '../../context/AppContext';
import { Box, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel, Checkbox, Menu, MenuItem, CheckboxProps, Select, FormControl, FormControlLabel, FormLabel, TextField } from '@material-ui/core';
import { IDataRecord, IDataSourceQueryStatus, IDataConnector } from '../dataInterfaces';

import SearchBox from './SearchBox';
//import OperationDialog from 'components/OperationDialog';
import MasterDataSelect, { IMasterDataRecord } from '../DataSelect';
//import { selectAsyncTheme } from 'theme/selectAsyncTheme';

const styles = (theme: Theme) => createStyles({
    paper: {
        overflow: 'hidden',
    },
    searchBar: {
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
    },
    searchBoxWrapper: {
        [theme.breakpoints.down('md')]: {
            marginTop: theme.spacing(1)
        }
    },
    block: {
        display: 'block',
    },
    addUser: {
        marginRight: theme.spacing(1)
    },
    contentWrapper: {
        margin: 16,
    },
    dataCell: {
        padding: theme.spacing(0, 1, 0, 0.5)
    },
    headerCell: {
        whiteSpace: 'nowrap'
    },
    selectedRow: {
        backgroundColor: blue[50]
    },
    tabBar: {
        backgroundColor: theme.palette.common.white,
        borderBottom: '1px solid',
        borderBottomColor: theme.palette.divider
    },
    footerContainer: {
        marginTop: theme.spacing(2)
    },
    footerActionButton: {
        marginRight: theme.spacing(1)
    },
    pageSizeSelectorContainer: {
        display: 'flex',
        alignItems: 'flex-start'
    },
    pageSizeSelector: {
        color: blue[500],
        borderBottom: '1px dashed',
        marginLeft: theme.spacing(1),
        cursor: 'pointer'
    }
});

const RowCheckbox = withStyles((theme: Theme) => createStyles({
    root: {
        color: theme.palette.primary.main,
        '&$checked': {
            color: theme.palette.primary.main,
        },
    },
    checked: {},
}))((props: CheckboxProps) => <Checkbox color="default" {...props} />);

export type ColumnDataType = "BOOLEAN" | "INTEGER" | "DECIMAL" | "DATE" | "STRING" | "REFERENCE" | "ENUM";

interface FilterEditorSelectOption {
    value: string;
    label: string;
}

export interface IDataSetColumn<TRecord extends IDataRecord, TWhereInput> {
    id: string;
    name: string;
    align?: "left" | "right" | "center";
    sortKey?: string;
    render(record: TRecord): ReactNode;
    applyReferenceFilter?: (rule: FilterRuleReference, input: IDataRecord[]) => TWhereInput;
    filterKey?: string;
    filterActive?: boolean;
    filterDataType?: ColumnDataType;
    filterSelectOptions?: FilterEditorSelectOption[];
    filterConnector?: IDataConnector<IMasterDataRecord, any, any>;
}

type DataSetToolbarOptions = {
    createEnabled?: boolean,
    viewEnabled?: boolean,
    deleteEnabled?: boolean,
    refreshEnabled?: boolean,
    columnSelectorEnabled?: boolean,
    filterEnabled?: boolean,
    moreEnabled?: boolean
}

type FilterRuleString = "EQUALS" | "NOT_EQUALS" | "CONTAINS" | "STARTS_WITH" | "ENDS_WITH";
type FilterRuleNumber = "EQUALS" | "NOT_EQUALS" | "GTE" | "LTE" | "RANGE";
type FilterRuleDate = "EQUALS" | "NOT_EQUALS" | "GTE" | "LTE" | "RANGE";
type FilterRuleReference = "EVERY" | "SOME" | "NONE";
type FilterRuleEnum = "INCLUDE" | "EXCLUDE";

export interface ColumnFilterEditResult {

    boolean?: {
        value: boolean;
    },

    string?: {
        rule?: FilterRuleString;
        value: string;
    },

    number?: {
        rule?: FilterRuleNumber;
        minValue: number;
        maxValue: number;
    },

    date?: {
        rule?: FilterRuleDate;
        minValue: Date;
        maxValue: Date;
    },

    reference?: {
        rule?: FilterRuleReference;
        value: IDataRecord[];
    },

    select?: {
        rule?: FilterRuleEnum;
        value: string[];
    }
}

export interface ColumnFilterSettings<TRecord extends IDataRecord, TWhereInput> {
    dataType: "BOOLEAN" | "INTEGER" | "DECIMAL" | "DATE" | "STRING" | "REFERENCE";
    connector?: IDataConnector<TRecord, TWhereInput, any>;
    referencePicker?: "SELECT" | "GRID";
}

interface EditFilterDialogProps<TRecord extends IDataRecord> extends WithStyles<{}> {
    open: boolean;
    column: IDataSetColumn<TRecord, any>;
    value?: ColumnFilterEditResult;
    onClose: () => void;
    onChange: (value: ColumnFilterEditResult) => void;
}

interface EditFilterDialogState {
    value: ColumnFilterEditResult;
}

class EditFilterDialogS<TRecord extends IDataRecord> extends React.Component<EditFilterDialogProps<TRecord>, EditFilterDialogState> {

    constructor(props: EditFilterDialogProps<TRecord>) {
        super(props);
        this.state = { value: this.props.value ? { ...this.props.value } : {} };
    }

    renderForm = (): React.ReactElement | null => {
        const { column } = this.props;
        switch (column.filterDataType) {
            case "BOOLEAN":
                break;
            case "STRING":
                return this.renderFormString();
            case "INTEGER":
            case "DECIMAL":
            case "DATE":
                return this.renderFormNumber();
            case "REFERENCE":
                return this.renderFormReference();
            case "ENUM":
                return this.renderFormEnum();
        }

        return null;
    }

    renderFormString = () => {
        const { value } = this.state;
        const ruleValue = value && value.string && value.string.rule ? value.string.rule : "NO_FILTER";
        const fieldValue = value && value.string ? value.string.value : "";

        const changeRule = (e: React.ChangeEvent<{ name?: string; value: FilterRuleString; }>) => {
            const value = { ...this.state.value };
            if (value.string) {
                value.string.rule = e.target.value;
            } else {
                value.string = {
                    rule: e.target.value,
                    value: ""
                };
            }

            this.setState({ value });
        }

        const changeValue = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const value = { ...this.state.value };
            if (value.string) {
                value.string.value = e.target.value;
            } else {
                value.string = {
                    rule: undefined,
                    value: e.target.value
                };
            }

            this.setState({ value });
        }

        return (
            <Grid container spacing={2} >
                <Grid item lg={4}>
                    <FormControl fullWidth>
                        <FormLabel>Rule</FormLabel>
                        <Select variant="filled" value={ruleValue} onChange={(e: any) => changeRule(e)}>
                            <MenuItem value="NO_FILTER">NO FILTER</MenuItem>
                            <MenuItem value="EQUALS">EQUALS</MenuItem>
                            <MenuItem value="NOT_EQUALS">NOT EQUALS</MenuItem>
                            <MenuItem value="CONTAINS">CONTAINS</MenuItem>
                            <MenuItem value="STARTS_WITH">STARTS WITH</MenuItem>
                            <MenuItem value="ENDS_WITH">ENDS WITH</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item lg={8}>
                    <FormControl fullWidth>
                        <FormLabel>Value</FormLabel>
                        <TextField variant="filled" value={fieldValue} onChange={changeValue} />
                    </FormControl>
                </Grid>
            </Grid>
        );
    }

    renderFormNumber = () => {
        const { column } = this.props;
        const { value } = this.state;

        let ruleValue = "NO_FILTER";

        if (value) {
            if ((column.filterDataType === "INTEGER" || column.filterDataType === "DECIMAL") && value.number) {
                ruleValue = value.number.rule || "NO_FILTER";
            } else if (column.filterDataType === "DATE" && value.date) {
                ruleValue = value.date.rule || "NO_FILTER";
            }
        }

        let minValue: number | Date | undefined = undefined;
        let maxValue: number | Date | undefined = undefined;

        switch (column.filterDataType) {
            case "INTEGER":
            case "DECIMAL":
                minValue = value && value.number ? value.number.minValue : undefined;
                minValue = value && value.number ? value.number.maxValue : undefined;
                break;
            case "DATE":
                minValue = value && value.date ? value.date.minValue : undefined;
                minValue = value && value.date ? value.date.maxValue : undefined;
                break;
        }

        return (
            <Grid container spacing={2} >
                <Grid item lg={4}>
                    <FormControl fullWidth>
                        <FormLabel>Rule</FormLabel>
                        <Select variant="filled" value={ruleValue}>
                            <MenuItem value="NO_FILTER">NO FILTER</MenuItem>
                            <MenuItem value="EQUALS">EQUALS</MenuItem>
                            <MenuItem value="NOT_EQUALS">NOT EQUALS</MenuItem>
                            <MenuItem value="CONTAINS">GREATER THAN OR EQUAL</MenuItem>
                            <MenuItem value="STARTS_WITH">LOWER THAN OR EQUAL</MenuItem>
                            <MenuItem value="ENDS_WITH">RANGE (INCLUSIVE)</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item lg={4}>
                    <FormControl fullWidth>
                        <FormLabel>Min. Value</FormLabel>
                        <TextField variant="filled" value={minValue} />
                    </FormControl>
                </Grid>
                <Grid item lg={4}>
                    <FormControl fullWidth disabled>
                        <FormLabel>Max. Value</FormLabel>
                        <TextField disabled variant="filled" value={maxValue} />
                    </FormControl>
                </Grid>
            </Grid>
        );
    }

    renderFormReference = () => {
        const { column } = this.props;

        if (!column.filterConnector || column.filterDataType !== "REFERENCE") {
            return null;
        }

        const { value } = this.state;
        const ruleValue = value && value.reference ? value.reference.rule : "NO_FILTER";

        const changeRule = (e: React.ChangeEvent<{ name?: string; value: FilterRuleReference; }>) => {
            const value = { ...this.state.value };
            if (value.reference) {
                value.reference.rule = e.target.value;
                if ((e.target.value as string) === "NO_FILTER") {
                    value.reference.value = [];
                }
            } else {
                value.reference = {
                    rule: e.target.value,
                    value: []
                };
            }

            this.setState({ value });
        }

        const changeValue = (items: IMasterDataRecord[]) => {
            const value = { ...this.state.value };
            const filtered = items.filter(x => (x !== undefined && x !== null));
            if (value.reference) {
                /*                
                const values = value.reference.value && value.reference.value.length ? [...value.reference.value] : [];
                                for(const item )
                                */
                console.log('ref value change');
                console.log(items);
                value.reference.value = filtered;
            } else {
                value.reference = {
                    rule: undefined,
                    value: filtered
                };
            }

            this.setState({ value });
        }

        return (
            <Grid container spacing={2} >
                <Grid item lg={4}>
                    <FormControl fullWidth>
                        <FormLabel>Rule</FormLabel>
                        <Select style={{ minHeight: 45 }} variant="filled" value={ruleValue} onChange={(e: any) => changeRule(e)} >
                            <MenuItem value="NO_FILTER">NO FILTER</MenuItem>
                            <MenuItem value="SOME">ANY</MenuItem>
                            <MenuItem value="EVERY">ALL</MenuItem>
                            <MenuItem value="NONE">NONE</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item lg={8}>
                    <FormControl fullWidth>
                        <FormLabel>Selected items</FormLabel>
                        <MasterDataSelect
                            placeholder="Enter 3 or more letters to search..."
                            dataConnector={column.filterConnector}
                            //styles={selectAsyncTheme((this.props as any).theme as Theme)}
                            value={value.reference ? (value.reference.value as IMasterDataRecord[]) : []}
                            onChange={changeValue}
                            allowMultiSelect
                        />
                    </FormControl>
                </Grid>
            </Grid>
        );
    }

    renderFormEnum = () => {
        const { column } = this.props;

        if (column.filterDataType !== "ENUM" || !column.filterSelectOptions || column.filterSelectOptions.length === 0) {
            return null;
        }

        const { value } = this.state;
        const ruleValue = value && value.select ? value.select.rule : "NO_FILTER";

        const changeRule = (e: React.ChangeEvent<{ name?: string; value: FilterRuleEnum; }>) => {
            const value = { ...this.state.value };
            if (value.select) {
                value.select.rule = e.target.value;
                if ((e.target.value as string) === "NO_FILTER") {
                    value.select.value = [];
                }
            } else {
                value.select = {
                    rule: e.target.value,
                    value: []
                };
            }

            this.setState({ value });
        }

        const changeValue = (items: FilterEditorSelectOption[]) => {
            const value = { ...this.state.value };
            const filtered = items.filter(x => (x !== undefined && x !== null));
            if (value.select) {
                value.select.value = filtered.map(x => x.value);
            } else {
                value.select = {
                    rule: undefined,
                    value: filtered.map(x => x.value)
                };
            }

            this.setState({ value });
        }

        return (
            <Grid container spacing={2} >
                <Grid item lg={4}>
                    <FormControl fullWidth>
                        <FormLabel>Rule</FormLabel>
                        <Select style={{ minHeight: 45 }} variant="filled" value={ruleValue ? ruleValue : "NO_FILTER"} onChange={(e: any) => changeRule(e)} >
                            <MenuItem value="NO_FILTER">NO FILTER</MenuItem>
                            <MenuItem value="INCLUDE">INCLUDE</MenuItem>
                            <MenuItem value="EXCLUDE">EXCLUDE</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item lg={8}>
                    <FormControl fullWidth>
                        <FormLabel>Selected items</FormLabel>
                        <ReactSelect
                            //styles={selectAsyncTheme((this.props as any).theme as Theme)}
                            placeholder="Select one or many options"
                            isClearable
                            options={column.filterSelectOptions}
                            tabSelectsValue={false}
                            //onChange={changeValue}
                            isMulti={true}
                            defaultValue={value.select && value.select.value ? value.select.value.map(x => ({ value: x, label: column.filterSelectOptions!.find(o => o.value === x)!.label, })) : []}
                        />
                    </FormControl>
                </Grid>
            </Grid>
        );
    }

    render() {
        const { column, value } = this.props;
        return (
            <Modal
                open={this.props.open}
                title={`Edit filter for: ${column.name}`}
                onClose={this.props.onClose}
                onSubmit={() => this.props.onChange(this.state.value)}
            >
                {this.renderForm() as any}
            </Modal>
        )
    }
}

const EditFilterDialog = withStyles(() => { }, { withTheme: true })(EditFilterDialogS);

interface DataSetProps<TRecord extends IDataRecord, TWhereInput> extends WithStyles<typeof styles> {
    dataSource: IDataConnector<TRecord, any, any>;
    columns: Array<IDataSetColumn<TRecord, TWhereInput>>;
    onReady?(dataSet: DataSetApi<TRecord>): void
    onCreateItem?(): void;
    onDeleteItems?(items: TRecord[]): void;
    onViewDetails?(item: TRecord): void;
    onPickerSelectItem?(item: TRecord): void;
    onPickerCancel?(): void;
    hideActionsToolbar?: boolean;
    hideDataToolbar?: boolean;
    toolbarOptions?: DataSetToolbarOptions;
    variant?: "default" | "search-picker";
    itemSelection?: "none" | "single" | "multiple";
    elevation?: number;
    square?: boolean;
    defaultSortKey?: string;
    defaultSortDirection?: "asc" | "desc";
    storageKey: string;
}

type DataSetState<TRecord extends IDataRecord> = {
    pageData: Array<TRecord>,
    currentPage: number,
    pageSize: number,
    totalRecords: number,
    totalPages: number,
    pageSizeMenuAnchor: HTMLElement | null,
    isDataLoaded: boolean,
    dataSourceState: "idle" | "busy" | "busy-errors",
    dataSourceLastOperationSuccess: boolean,
    selectedRows: Array<number>,
    searchPhrase?: string;
    sortKey?: string;
    sortDirection?: "asc" | "desc";

    filterEditorColumnId?: string;
    columnFiltersData: { [key: string]: ColumnFilterEditResult };
}

export interface DataSetApi<TRecord> {
    refreshData: () => void;
    getSelectedItems: () => TRecord[];
}

class DataSet<TRecord extends IDataRecord, TWhereInput> extends Component<DataSetProps<TRecord, TWhereInput>, DataSetState<TRecord>> {
    private isUnmounted: boolean = false;
    constructor(props: DataSetProps<TRecord, TWhereInput>) {
        super(props);
        this.state = {
            pageData: [],
            currentPage: 1,
            pageSize: 10,
            totalRecords: 0,
            totalPages: 1,
            pageSizeMenuAnchor: null,
            isDataLoaded: false,
            dataSourceState: "idle",
            dataSourceLastOperationSuccess: false,
            selectedRows: [],
            columnFiltersData: {}
        };
    }

    componentDidMount = async () => {
        this.updateDataFromDataset();

        if (this.props.onReady) {
            this.props.onReady({
                refreshData: () => this.updateDataFromDataset(),
                getSelectedItems: () => {
                    return this.state.pageData.filter((x, idx) => this.state.selectedRows.includes(idx) ? x : false);
                }
            });
        }
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    updateTotalPagesCount(): void {
        const totalPages = this.state.totalRecords <= this.state.pageSize ? 1 : Math.ceil(this.state.totalRecords / this.state.pageSize);
        if (totalPages !== this.state.totalPages) {
            this.setState({ totalPages: totalPages });
        }
    }

    handleSearchSubmit = (searchText: string) => {
        if (searchText !== this.state.searchPhrase) {
            this.setState({ currentPage: 1, searchPhrase: searchText }, () => {
                this.updateDataFromDataset();
            });
        }
    }

    onCreateItemClick = () => {
        if (this.props.onCreateItem) {
            this.props.onCreateItem();
        }
    }

    onDeleteItemClick = () => {
        if (this.props.onDeleteItems && this.state.selectedRows.length > 0) {
            const items = this.state.pageData.filter((val, idx) => this.state.selectedRows.includes(idx) ? val : null);
            this.props.onDeleteItems(items);
        }
    }

    onViewDetailsClick = () => {
        if (this.props.onViewDetails && this.state.selectedRows.length === 1) {
            const item = this.state.pageData[this.state.selectedRows[0]];
            this.props.onViewDetails(item);
        }
    }

    handleSelectPageSizeClick = (event: React.MouseEvent<HTMLElement>) => {
        this.setState({ pageSizeMenuAnchor: event.currentTarget });
    }

    handleSelectPageSize = (size: number) => {
        if (size !== 0 && size !== this.state.pageSize) {
            this.setState({ currentPage: 1, pageSize: size, pageSizeMenuAnchor: null }, () => {
                this.updateDataFromDataset();
            })
        } else {
            this.setState({ pageSizeMenuAnchor: null });
        }
    }

    handleNextPageClick = () => {
        this.setState(state => ({ currentPage: state.currentPage + 1 }), () => {
            this.updateDataFromDataset();
        });
    }

    handlePrevPageClick = () => {
        this.setState(state => ({ currentPage: state.currentPage - 1 }), () => {
            this.updateDataFromDataset();
        });
    }

    handleFirstPageClick = () => {
        this.setState({ currentPage: 1, pageData: [] }, () => {
            this.updateDataFromDataset();
        });
    }

    handleLastPageClick = () => {
        const lastPage = this.state.totalPages;
        this.setState({ currentPage: lastPage }, () => {
            this.updateDataFromDataset();
        });
    }

    handleSelectAllRowsClick = () => {
        if (this.state.selectedRows.length < this.state.pageSize) {
            var newSelected: Array<number> = [];
            for (var i = 0; i < this.state.pageSize; i++) {
                newSelected.push(i);
            }
            this.setState({ selectedRows: newSelected });
        } else {
            this.setState({ selectedRows: [] });
        }
    }

    handleRowSelectClick = (rowNumber: number) => {
        var newSelected: Array<number> = [];
        if (this.state.selectedRows.includes(rowNumber)) {
            newSelected = [...this.state.selectedRows];
            newSelected.splice(newSelected.indexOf(rowNumber), 1);
        } else {
            newSelected = (this.props.itemSelection === "multiple" ? [...this.state.selectedRows] : []);
            newSelected.push(rowNumber);
        }

        this.setState({ selectedRows: newSelected });
    }

    updateDataFromDataset = async () => {
        this.setState({ dataSourceState: "busy", dataSourceLastOperationSuccess: false, selectedRows: [] }, this.getPageData);
    }

    dataUpdateStatusCallback = (status: IDataSourceQueryStatus) => {
        if (this.isUnmounted) {
            return;
        } else {
            var newDataSourceState: "busy" | "busy-errors" = status.isError ? "busy-errors" : "busy";
            if (newDataSourceState !== this.state.dataSourceState) {
                this.setState({ dataSourceState: newDataSourceState });
            }
        }
    }

    getFilter = (): TWhereInput | undefined => {
        let { columnFiltersData } = this.state;
        const { columns } = this.props;

        if (!columnFiltersData || Object.getOwnPropertyNames(columnFiltersData).length === 0) {
            const storedFilterData = sessionStorage.getItem(this.props.storageKey);
            if (storedFilterData && storedFilterData.length) {
                columnFiltersData = JSON.parse(storedFilterData);
                this.setState({ columnFiltersData });
            } else {
                return undefined;
            }
        }
        else {
            const filterJson = JSON.stringify(columnFiltersData);
            sessionStorage.setItem(this.props.storageKey, filterJson);
        }

        let filter: any = {};

        for (const columnId in columnFiltersData) {
            const column = columns.find(x => x.id === columnId);
            if (!column) {
                continue;
            }

            const filterData = columnFiltersData[columnId];

            if (column.filterDataType === "STRING" && filterData.string) {
                switch (filterData.string.rule) {
                    case "EQUALS":
                        filter[`${column.filterKey}`] = filterData.string.value;
                        break;
                    case "NOT_EQUALS":
                        filter[`${column.filterKey}_not`] = filterData.string.value;
                        break;
                    case "CONTAINS":
                        filter[`${column.filterKey}_contains`] = filterData.string.value;
                        break;
                    case "STARTS_WITH":
                        filter[`${column.filterKey}_starts_with`] = filterData.string.value;
                        break;
                    case "ENDS_WITH":
                        filter[`${column.filterKey}_ends_with`] = filterData.string.value;
                        break;
                }
            }

            if (column.filterDataType === "ENUM" && filterData.select) {
                switch (filterData.select.rule) {
                    case "INCLUDE":
                        filter[`${column.filterKey}_in`] = filterData.select.value;
                        break;
                    case "EXCLUDE":
                        filter[`${column.filterKey}_not_in`] = filterData.select.value;
                        break;
                }
            }

            if (column.filterDataType === "REFERENCE" && column.applyReferenceFilter && filterData.reference && filterData.reference.value.length) {
                const columnFilter = column.applyReferenceFilter(filterData.reference.rule!, filterData.reference.value);

                if (columnFilter) {
                    filter = Object.getOwnPropertyNames(filter).length > 0
                        ? {
                            AND: [
                                { ...filter },
                                { ...columnFilter }
                            ]
                        }
                        : {
                            ...columnFilter
                        };
                }
            }
        }

        return filter;
    }

    clearFilter = () => {
        sessionStorage.removeItem(this.props.storageKey);
        this.setState({ columnFiltersData: {} }, this.updateDataFromDataset);
    }

    getPageData = async () => {
        const filter = this.props.dataSource.makeFilter(this.getFilter(), this.state.searchPhrase);
        const countResult = await this.props.dataSource.count(filter, this.dataUpdateStatusCallback);

        if (this.isUnmounted) {
            return;
        }

        if (!countResult.isSuccessful) {
            this.setState({ pageData: [], isDataLoaded: true, dataSourceState: "idle", dataSourceLastOperationSuccess: false });

        } else {

            if (countResult.count !== this.state.totalRecords) {
                this.setState({ totalRecords: countResult.count }, () => {
                    this.updateTotalPagesCount();
                });
            }

            let orderBy: string | undefined = this.props.defaultSortDirection && this.props.defaultSortKey
                ? this.props.defaultSortKey + "_" + this.props.defaultSortDirection.toUpperCase()
                : undefined;

            if (this.state.sortKey && this.state.sortDirection) {
                orderBy = this.state.sortKey + "_" + this.state.sortDirection.toUpperCase();
            }

            if (countResult.count > 0) {
                var result = await this.props.dataSource.getPage(filter, orderBy, this.state.currentPage, this.state.pageSize, undefined, this.dataUpdateStatusCallback);

                if (this.isUnmounted) {
                    return;
                }

                this.setState({ pageData: result.data, isDataLoaded: true, dataSourceState: "idle", dataSourceLastOperationSuccess: result.isSuccessful !== true });
            } else {
                this.setState({ pageData: [], isDataLoaded: true, dataSourceState: "idle", dataSourceLastOperationSuccess: true });
            }
        }
    }

    renderStatusLabel() {
        if (this.state.pageData.length > 0) {
            return null;
        }

        if (this.state.dataSourceState !== "idle") {
            return (<Typography color="textSecondary" align="center">Loading data...</Typography>);
        }

        if (false === this.state.dataSourceLastOperationSuccess) {
            return (<Typography color="error" align="center">Failed to fetch the data. Click refresh to try again.</Typography>);
        }

        return (<Typography color="textSecondary" align="center">No records available</Typography>);
    }

    renderSearchBar() {
        const { classes } = this.props;

        const filterColumns = Object.getOwnPropertyNames(this.state.columnFiltersData);

        if (filterColumns.length > 0) {
            return (
                <Grid item sm={12} md={6}>
                    <Grid container spacing={2} alignItems="center" justify="flex-start">
                        <Grid item>
                            <FilterListIcon color="primary" fontSize="default" />
                        </Grid>
                        <Grid item>
                            <Typography color="primary" variant="subtitle2" component="span">Filter enabled on {filterColumns.length} columns: {filterColumns.map(col => this.props.columns.find(x => x.id === col)!.name).join(', ')}</Typography>
                        </Grid>
                        <Grid item>
                            <Button
                                size="small"
                                variant="text"
                                color="secondary"
                                onClick={this.clearFilter}
                                startIcon={<ClearIcon />}>Clear filter</Button>
                        </Grid>
                    </Grid>
                </Grid>
            )
        }

        if (this.props.variant === "search-picker" || (this.props.hideActionsToolbar && this.props.hideDataToolbar)) {
            return (
                <Grid item xs={12}>
                    <div className={classes.searchBoxWrapper}>
                        <SearchBox disabled={this.state.dataSourceState !== "idle"} onSubmit={this.handleSearchSubmit} />
                    </div>
                </Grid>
            );
        } else {
            return (
                <Grid item sm={12} md={6}>
                    <div className={classes.searchBoxWrapper}>
                        <SearchBox disabled={this.state.dataSourceState !== "idle"} onSubmit={this.handleSearchSubmit} />
                    </div>
                </Grid>
            );
        }
    }

    renderToolbars() {
        const { classes } = this.props;
        if (this.props.variant === "search-picker" || (this.props.hideActionsToolbar && this.props.hideDataToolbar)) {
            return null;
        } else {
            return (
                <Grid sm={12} md={6} item>
                    <Grid container spacing={5} justify="flex-end" alignItems="center">
                        {this.props.hideActionsToolbar !== true && (
                            <Grid item>
                                <Tooltip title="Add profile">
                                    <IconButton onClick={this.onCreateItemClick}>
                                        <AddIcon className={classes.block} htmlColor={green[500]} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="View profile">
                                    <span>
                                        <IconButton onClick={this.onViewDetailsClick} disabled={this.state.selectedRows.length !== 1}>
                                            <EditIcon className={classes.block} color={this.state.selectedRows.length === 1 ? "primary" : "disabled"} />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                {this.props.onDeleteItems && (
                                    <Tooltip title="Delete item(s)">
                                        <IconButton onClick={this.onDeleteItemClick} disabled={this.state.selectedRows.length === 0}>
                                            {this.state.selectedRows.length > 0 && (
                                                <DeleteIcon className={classes.block} htmlColor={red[500]} />
                                            )}
                                            {this.state.selectedRows.length === 0 && (
                                                <DeleteIcon className={classes.block} color="disabled" />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Grid>
                        )}
                        <Grid item>
                            <Tooltip title="Refresh data">
                                <IconButton onClick={this.updateDataFromDataset}>
                                    <RefreshIcon className={classes.block} />
                                </IconButton>
                            </Tooltip>
                            {this.props.toolbarOptions && this.props.toolbarOptions.columnSelectorEnabled !== false && (
                                <Tooltip title="Select columns">
                                    <IconButton>
                                        <ViewColumnIcon className={classes.block} />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {this.props.toolbarOptions && this.props.toolbarOptions.filterEnabled !== false && (
                                <Tooltip title="Filter">
                                    <IconButton>
                                        <FilterListIcon className={classes.block} htmlColor={blue[500]} />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            );
        }
    }

    renderFooter() {
        const { classes } = this.props;

        if (this.props.variant === "search-picker") {

            return (
                <div className={classes.footerContainer}>
                    <Grid container spacing={3} alignItems="center" justify="space-between">
                        <Grid item>
                            <Button
                                className={classes.footerActionButton}
                                variant="contained"
                                color="primary"
                                disabled={this.state.selectedRows.length === 0}
                                onClick={() => {
                                    if (this.props.onPickerSelectItem && this.state.selectedRows.length > 0) {
                                        this.props.onPickerSelectItem(this.state.pageData[this.state.selectedRows[0]]);
                                    }
                                }}
                            >Select</Button>
                            <Button color="secondary" onClick={() => {
                                if (this.props.onPickerCancel)
                                    this.props.onPickerCancel();
                            }}>Cancel</Button>
                        </Grid>
                        <Grid item>
                            {this.renderPagination()}
                        </Grid>
                    </Grid>
                </div>
            )

        } else {
            return (
                <div className={classes.footerContainer}>
                    {this.renderPagination()}
                </div>
            );
        }
    }

    renderPagination() {
        const { classes } = this.props;
        return (
            <Grid container spacing={0} alignItems="center" justify="flex-end">
                {this.props.variant !== "search-picker" && (
                    <Grid item>
                        <Grid container spacing={5} alignItems="flex-start">
                            <Grid item>
                                <div className={classes.pageSizeSelectorContainer}>
                                    <Typography color="textSecondary">Display:</Typography>
                                    <Typography className={classes.pageSizeSelector} onClick={this.handleSelectPageSizeClick}>{this.state.pageSize}</Typography>
                                </div>
                                <Menu anchorEl={this.state.pageSizeMenuAnchor} open={Boolean(this.state.pageSizeMenuAnchor)} onClose={() => this.handleSelectPageSize(0)}>
                                    <MenuItem onClick={() => this.handleSelectPageSize(10)}>10</MenuItem>
                                    <MenuItem onClick={() => this.handleSelectPageSize(25)}>25</MenuItem>
                                    <MenuItem onClick={() => this.handleSelectPageSize(50)}>50</MenuItem>
                                    <MenuItem onClick={() => this.handleSelectPageSize(100)}>100</MenuItem>
                                </Menu>
                            </Grid>
                            <Grid item>
                                <Typography color="textSecondary">{(this.state.currentPage - 1) * this.state.pageSize + 1} - {((this.state.currentPage - 1) * this.state.pageSize) + this.state.pageData.length} of {this.state.totalRecords}</Typography>
                            </Grid>
                        </Grid>
                    </Grid>
                )}
                <Grid item>
                    <Grid container alignItems="center">
                        <Grid item>
                            <Tooltip title="First page" leaveDelay={100}>
                                <div>
                                    <IconButton disabled={this.state.dataSourceState !== "idle" || this.state.currentPage === 1} onClick={this.handleFirstPageClick}>
                                        <FirstPageIcon className={classes.block} color="inherit" />
                                    </IconButton>
                                </div>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title="Previous page" leaveDelay={100}>
                                <div>
                                    <IconButton disabled={this.state.dataSourceState !== "idle" || this.state.currentPage === 1} onClick={this.handlePrevPageClick}>
                                        <PrevPageIcon className={classes.block} color="inherit" />
                                    </IconButton>
                                </div>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title="Next page" leaveDelay={100}>
                                <div>
                                    <IconButton disabled={this.state.dataSourceState !== "idle" || this.state.currentPage === this.state.totalPages} onClick={this.handleNextPageClick}>
                                        <NextPageIcon className={classes.block} color="inherit" />
                                    </IconButton>
                                </div>
                            </Tooltip>
                        </Grid>
                        <Grid item>
                            <Tooltip title="Last page" leaveDelay={100}>
                                <div>
                                    <IconButton disabled={this.state.dataSourceState !== "idle" || this.state.currentPage === this.state.totalPages} onClick={this.handleLastPageClick}>
                                        <LastPageIcon className={classes.block} color="inherit" />
                                    </IconButton>
                                </div>
                            </Tooltip>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        );
    }

    getElevation(): number {
        if (this.props.elevation === 0) {
            return 0;
        } else {
            if (this.props.elevation) {
                return this.props.elevation;
            } else {
                return 1;
            }
        }
    }

    render() {
        const { classes } = this.props;
        //let ctx = this.context as IAppContext;

        let filterEditorColumn: IDataSetColumn<TRecord, TWhereInput> | undefined = undefined;
        if (this.state.filterEditorColumnId) {
            filterEditorColumn = this.props.columns.find(x => x.id === this.state.filterEditorColumnId);
        }

        return (
            <Paper className={classes.paper} elevation={this.getElevation()} square={this.props.square === false ? true : false}>
                {filterEditorColumn !== undefined && (
                    <EditFilterDialog
                        open={true}
                        onClose={() => this.setState({ filterEditorColumnId: undefined })}
                        column={filterEditorColumn}
                        value={this.state.columnFiltersData[filterEditorColumn.id]}
                        onChange={(result) => {
                            const data = { ...this.state.columnFiltersData };
                            data[filterEditorColumn!.id] = result;
                            this.setState({ columnFiltersData: data, filterEditorColumnId: undefined }, () => {
                                this.updateDataFromDataset();
                            });
                        }}
                    />
                )}
                <AppBar className={classes.searchBar} position="static" color="default" elevation={0}>
                    <Toolbar>
                        <Grid container spacing={5} alignItems="center" justify="space-between">
                            {this.renderSearchBar()}
                            {this.renderToolbars()}
                        </Grid>
                    </Toolbar>
                </AppBar>
                {this.state.dataSourceState !== "idle" && (
                    <LinearProgress color={this.state.dataSourceState === "busy-errors" ? "secondary" : "primary"} />
                )}
                {this.state.dataSourceState === "idle" && (
                    <div style={{ height: 4 }}></div>
                )}
                <div className={classes.contentWrapper}>
                    {this.renderStatusLabel()}
                    {this.state.isDataLoaded && (
                        <Fragment>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {this.props.itemSelection !== "none" && (
                                            <TableCell padding="checkbox">
                                                {this.props.itemSelection === "multiple" && (
                                                    <RowCheckbox
                                                        indeterminate={this.state.selectedRows.length > 0 && this.state.selectedRows.length < this.state.pageSize}
                                                        checked={this.state.selectedRows.length === this.state.pageSize}
                                                        onChange={this.handleSelectAllRowsClick}
                                                    />
                                                )}
                                            </TableCell>
                                        )}
                                        {this.props.columns.map((col, index) => (
                                            <TableCell key={index} className={classNames(classes.dataCell, classes.headerCell)} align={col.align}>
                                                {col.sortKey && (
                                                    <TableSortLabel
                                                        hideSortIcon
                                                        active={this.state.sortKey === col.sortKey}
                                                        direction={this.state.sortDirection || "asc"}
                                                        onClick={() => {
                                                            if (this.state.sortKey === col.sortKey) {
                                                                if (this.state.sortDirection === "asc") {
                                                                    this.setState({ sortKey: col.sortKey, sortDirection: "desc" });
                                                                    this.updateDataFromDataset();
                                                                } else {
                                                                    this.setState({ sortKey: undefined, sortDirection: "asc" });
                                                                    this.updateDataFromDataset();
                                                                }
                                                            } else {
                                                                this.setState({ sortKey: col.sortKey, sortDirection: "asc" });
                                                                this.updateDataFromDataset();
                                                            }
                                                        }}
                                                    >
                                                        {col.name}
                                                    </TableSortLabel>
                                                )}

                                                {!col.sortKey && (
                                                    <Fragment>{col.name}</Fragment>
                                                )}
                                                {col.filterKey && (
                                                    <IconButton aria-label="delete" color={col.id in this.state.columnFiltersData ? "primary" : "default"} style={{ marginLeft: 10 }} onClick={() => this.setState({ filterEditorColumnId: col.id })}>
                                                        <FilterListIcon fontSize="small" />
                                                    </IconButton>
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {this.state.pageData.map((record, rowNumber) => {
                                        var isRowSelected: boolean = this.state.selectedRows.includes(rowNumber);
                                        return (
                                            <TableRow key={record.id} className={classNames(isRowSelected && classes.selectedRow)}>
                                                {this.props.itemSelection !== "none" && (
                                                    <TableCell padding="checkbox">
                                                        <RowCheckbox checked={isRowSelected} onChange={() => this.handleRowSelectClick(rowNumber)} />
                                                    </TableCell>
                                                )}
                                                <Fragment>
                                                    {this.props.columns.map((col: IDataSetColumn<TRecord, TWhereInput>) => (
                                                        <TableCell key={col.name} align={col.align} className={classes.dataCell}>{col.render(record)}</TableCell>
                                                    ))}
                                                </Fragment>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            {this.renderFooter()}
                        </Fragment>
                    )}
                </div>
            </Paper>
        );
    }
}

//DataSet.contextType = AppContext;

// A workaround for generic component using withStyles
// https://stackoverflow.com/a/52573647/6913096
class WrappedDataSet<T extends IDataRecord, W> extends React.Component<
    // Or `PropsOf<WrappedBaseFormCard<T>["C"]>` from @material-ui/core if you don't mind the dependency.
    WrappedDataSet<T, W>["C"] extends React.ComponentType<infer P> ? P : never, {}> {
    private readonly C = withStyles(styles)(
        // JSX.LibraryManagedAttributes handles defaultProps, etc.  If you don't
        // need that, you can use `BaseFormCard<T>["props"]` or hard-code the props type.
        (props: JSX.LibraryManagedAttributes<typeof DataSet, DataSet<T, W>["props"]>) => <DataSet<T, W> {...props} />);
    render() {
        return <this.C {...this.props} />;
    }
}

export default WrappedDataSet;