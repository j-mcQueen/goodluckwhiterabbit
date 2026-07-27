import Loading from "../../../global/Loading";

const PortfolioFileInfo = ({ ...props }) => {
  const { spinner, renderCount, targetSubcategory, targetGroupId } = props;

  const activeGroup = targetSubcategory.groups.find(
    (group: { groupId: string; name: string; count: number }) =>
      group.groupId === targetGroupId,
  );

  return (
    <header className="flex justify-between items-center w-full py-5 px-5">
      <h2 className="xl:text-2xl tracking-tight">
        {activeGroup?.name.toUpperCase()}
      </h2>

      <ul className="flex gap-5 text-xl">
        {spinner ? (
          <li>
            <Loading />
          </li>
        ) : null}

        <li>
          <span className="text-rd">{activeGroup?.count ?? 0}</span> FILES IN
          STORAGE
        </li>

        <li>
          <span className="text-rd">{renderCount}</span> FILES DISPLAYED
        </li>
      </ul>
    </header>
  );
};
export default PortfolioFileInfo;
