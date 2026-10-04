import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Loading from "../global/Loading";

export default function NoticeDialog({ ...props }) {
  const { notice, setNotice } = props;

  // a shown message auto-dismisses after 5s - scheduled per notice and
  // cancelled when it changes, so a timer left over from an earlier notice
  // (or an earlier render) can't wipe a LOADING that has since replaced it
  useEffect(() => {
    if (!notice.status || notice.loading) return;
    const timeout = setTimeout(() => {
      setNotice({ status: false, loading: false, message: null });
    }, 5000);
    return () => clearTimeout(timeout);
  }, [notice, setNotice]);

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
          {notice.loading ? (
            <div className="bg-black border border-solid border-white py-2 px-3">
              <Loading />
            </div>
          ) : (
            // same message treatment as global/Notice.tsx
            <p className="text-white bg-black text-lg border border-solid border-rd p-2">
              + {(notice.message ?? "").toUpperCase()}
            </p>
          )}
        </motion.dialog>
      )}
    </AnimatePresence>
  );
}
