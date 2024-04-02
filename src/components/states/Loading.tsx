import CircularProgress from '@mui/material/CircularProgress';

export default function Loading() {
    return(
        <div className='flex justify-center items-center' style={{ height: 'calc(100vh - 72px)' }}>
            <CircularProgress />
        </div>
    );
}