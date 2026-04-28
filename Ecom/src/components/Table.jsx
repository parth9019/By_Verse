const Table = ({ columns, data, renderRow, renderActions }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 w-full overflow-hidden">
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left border-collapse min-w-max">
        <thead className="bg-gray-50/80 border-b border-gray-100">
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="p-4 text-sm font-semibold text-gray-700"
              >
                {col}
              </th>
            ))}
            {renderActions && <th className="p-4">Actions</th>}
          </tr>
        </thead>

        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="p-6 text-center text-gray-500"
              >
                No data found
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row._id}
                className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
              >
                {/* ✅ SAFE CHECK */}
                {renderRow ? (
                  renderRow(row, index)
                ) : (
                  <>
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">{row.name}</td>
                  </>
                )}

                {renderActions && (
                  <td className="p-4">{renderActions(row)}</td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default Table;
