import React, { FC } from "react";
import { Modal, Box } from "@mui/material";
type Props = {
  open: boolean; // login components
  setOpen: (open: boolean) => void;
  activeItem: any;
  component: any;
  setRoute?: (route: string) => void;
  refetch?:any
};

const CustomModel: FC<Props> = ({
  open,
  setOpen,
  setRoute,
  component: Component,
  refetch
}) => {
  return (
    <Modal
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-description="modal-modal-description"
    >
      <Box className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[95%] m-auto  800px:w-[450px] bg-white dark:bg-slate-900 rounded-[8px] shadow p-4 outline-none">
        {/* Login Component */}
        <Component setOpen={setOpen} setRoute={setRoute} refetch={refetch} /> 
      </Box>
    </Modal>
  );
};

export default CustomModel;
