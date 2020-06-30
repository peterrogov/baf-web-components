import { Theme } from '@material-ui/core/styles';
import { createStyles } from '@material-ui/styles';

export const DataViewStyles = (theme: Theme) => createStyles({
    container: {
        border: '1px solid rgba(0, 0, 0, 0.12)',
        backgroundColor: theme.palette.common.white
    }
});
