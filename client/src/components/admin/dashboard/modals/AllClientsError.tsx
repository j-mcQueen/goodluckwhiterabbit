import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AllClientsError({ ...props }) {
  const { getAllClientsError } = props;
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      // expired tokens will still be attached to browser, but logging in again will generate new ones so no logout request to server necessary
      return navigate("/admin");
    }, 10000);
  }, [navigate]);

  return (
    <dialog>
      <p>{getAllClientsError.message}</p>
    </dialog>
  );
}
