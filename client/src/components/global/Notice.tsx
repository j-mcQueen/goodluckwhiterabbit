import { useNavigate } from "react-router-dom";
import Loading from "./Loading";

export default function Notice({ ...props }) {
  // global component for loading indication +/ message appearance - accommodates prop variance in notice
  const { notice, setNotice } = props;
  const navigate = useNavigate();

  if (!notice.loading) {
    setTimeout(() => {
      if (!notice.logout) {
        // for portfolio calls only
        return setNotice({ status: false, loading: false, message: null });
      }

      setNotice({
        status: false,
        message: "",
        logout: { status: false, path: null },
      });
      if (notice.logout && notice.logout.status === true) {
        return navigate(notice.logout.path);
      }
    }, 5000);
  }

  return (
    <dialog open className="bg-black absolute bottom-0 mx-0 p-2 bg-inherit">
      {notice.loading === true ? (
        <Loading />
      ) : (
        <p className="text-white bg-black text-lg border border-solid border-rd p-2">
          + {notice.message.toUpperCase()}
        </p>
      )}
    </dialog>
  );
}
