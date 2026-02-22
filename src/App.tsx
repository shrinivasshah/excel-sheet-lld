import ExcelSheet from "./components/ExcelSheet";

function App() {
  return (
    <>
      <ExcelSheet>
        <ExcelSheet.Toolbar />
        <div className="container excel-grid-container">
          <ExcelSheet.Grid />
        </div>
      </ExcelSheet>
    </>
  );
}

export default App;
