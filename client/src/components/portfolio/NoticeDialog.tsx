import { AnimatePresence, motion } from "framer-motion";
import Loading from "../global/Loading";

export default function NoticeDialog({ ...props }) {
  const { notice, setNotice } = props;

  if (!notice.loading) {
    setTimeout(() => {
      return setNotice({ status: false, loading: false, message: null });
    }, 5000);
  }

  return (
    <AnimatePresence>
      {notice.status && (
        <motion.dialog
          initial={{ opacity: 0, translateY: 100 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0 }}
          open
          className="flex justify-center absolute right-0 left-0 bottom-0 w-full text-center mx-0 p-2 bg-inherit"
        >
          <div className="bg-black border border-solid border-white py-2 px-3">
            <Loading />
          </div>
        </motion.dialog>
      )}
    </AnimatePresence>
  );
}
