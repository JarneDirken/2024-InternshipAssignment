import MaterialUIModal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Button from '@/components/states/Button';
import ClearIcon from '@mui/icons-material/Clear';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

interface ModalCardProps {
    open: boolean;
    onClose: () => void;
    message: string;
};

export default function MessageModal({ open, onClose, message }: ModalCardProps) {
    return (
        <MaterialUIModal
            open={open}
            onClose={onClose}
            aria-labelledby="borrow-modal-title"
            aria-describedby="borrow-modal-description"
        >
            <Box
                className="modal-box bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] md:w-[50%] rounded-lg shadow-lg h-[50%] flex flex-col"
                >
                <div className="flex px-4 py-4 justify-between items-center border-b border-b-gray-300">
                    <div className="flex items-center gap-2">
                        <MailOutlineIcon />
                        <h1 id="borrow-modal-title" className="text-xl">Message</h1>
                    </div>
                    <ClearIcon className="cursor-pointer" onClick={onClose} />
                </div>
                <div id="modal-modal-description" className='overflow-y-auto flex-grow px-8 py-2 truncate'>
                    {message}
                </div>
                <div className="flex flex-row justify-center overflow-hidden items-center py-2 border-t border-t-gray-200 bottom-0">
                    <Button text="Close" onClick={onClose} />
                </div>
            </Box>
        </MaterialUIModal>
    );
};