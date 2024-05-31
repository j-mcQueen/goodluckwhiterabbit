import Actions from "./Actions";

export default function AllClients({ ...props }) {
  const { setActivePane } = props;

  return (
    <div className="text-white">
      <Actions setActivePane={setActivePane} />
    </div>
  );
}
