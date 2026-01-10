import { setRTL, toggleRTL } from "@/redux/slices/rtlSlice";
import { RootState } from "@/redux/store";
import { useDispatch, useSelector } from "react-redux";

export const useRTL = () => {
  const dispatch = useDispatch();
  const isRTL = useSelector((state: RootState) => state.rtl.isRTL);

  return {
    isRTL,
    toggleRTL: () => dispatch(toggleRTL()),
    setRTL: (value: boolean) => dispatch(setRTL(value)),
  };
};
