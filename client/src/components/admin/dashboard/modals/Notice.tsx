import { useNavigate } from "react-router-dom";

export default function Notice({ ...props }) {
  const { notice, setNotice } = props;
  const navigate = useNavigate();

  setTimeout(() => {
    setNotice({
      status: false,
      message: "",
      logout: { status: false, path: null },
    });
    if (notice.logout && notice.logout.status === true)
      navigate(notice.logout.path);
    return;
  }, 5000);

  return (
    <dialog open className="bg-black absolute bottom-0 mx-0 p-2 bg-inherit">
      <p className="text-white bg-black text-lg border border-solid border-rd p-2">
        + {notice.message.toUpperCase()}
      </p>
    </dialog>
  );
}
