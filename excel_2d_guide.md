# Building an Excel Sheet using 2D Objects

This guide explains how to build a basic spreadsheet application from scratch using a 2D array (a grid) and how to implement a formula engine in simple terms.

## Part 1: Logic for Building the Excel Sheet using 2D Objects

An Excel sheet is fundamentally a grid of rows and columns. In programming, the easiest way to represent this state is using a **2D Array** (an array of arrays).

### Step 1: The 2D Array Data Structure
Think of the grid as a list of rows, where each row is a list of cells.

```javascript
const rows = 100;
const cols = 26; // A to Z
const grid = [];

// Initialize an empty 100x26 grid
for (let r = 0; r < rows; r++) {
  const row = [];
  for (let c = 0; c < cols; c++) {
    row.push({
      id: getCellId(r, c), // e.g., "A1", "B2"
      value: "",           // Raw input typed by user (e.g., "=A1+5")
      computedValue: "",   // The evaluated result (e.g., "15")
    });
  }
  grid.push(row); // add the row to our 2D grid
}
```

### Step 2: Mapping 2D Coordinates to Excel IDs (A1, B2)
To make getting and setting logic easy, you need a way to convert between `(row, column)` indexes and cell IDs like `"A1"`.
* `Column 0` -> "A", `Column 1` -> "B"
* `Row 0` -> "1", `Row 1` -> "2"
* Therefore, the object at `grid[0][0]` gets the ID `"A1"`.

### Step 3: The UI (Rendering the 2D Object)
To render this to the screen, you loop through the outer array to create Rows, and loop through the inner arrays to create individual Cells (like HTML `<input>` elements).
* Every time a user types in a UI cell, you find the matching object inside your 2D `grid` array and update its `value` property.

---

## Part 2: Logic for Formulas to Work

Formulas make the sheet dynamic. If `C1 = A1 + B1`, then whenever `A1` or `B1` changes, `C1` must automatically update.

### Step 1: Parsing the Input
When a user finishes typing in a cell, you first check if the characters start with an equals sign `=`.
* **No `=`:** It's just plain text or a number. Store it as is: `computedValue` = `value`.
* **Starts with `=`:** It's a formula. We need to calculate it.

### Step 2: Replacing Cell References with Real Values
If a cell contains `=A1 + B2`, the computer doesn't know what A1 or B2 is. We need to extract those IDs and fetch their actual numbers.
1. Use a pattern matcher (Regex) to find all strings that look like Cell IDs (letters followed by numbers).
2. For each ID found, look it up in your 2D grid.
3. Replace the ID in the formula string with that cell's `computedValue`.
   * *User Formula:* `=A1 + B2`
   * *Lookups:* Grid says A1 is `5`, B2 is `10`.
   * *New String for Math:* `5 + 10`

### Step 3: Evaluating the Math
Once you have purely a math string like `5 + 10`, you process it to get the result (`15`). You can safely calculate this by parsing the math or strictly evaluating it.
Save the result `15` to this cell's `computedValue`.

### Step 4: The Ripple Effect (Dependency Graph)
This is the most critical logic for Excel. If `A1` changes, `B1` needs to know. To solve this, we add two new memory lists to every cell object:
1. **Dependencies:** Cells I depend on to calculate my own value.
2. **Dependents (Subscribers):** Cells that depend on me. If I change, I must tell them to update.

**How it plays out:**
* You type `=A1 + 10` into `B1`.
* `B1` parses the text and realizes it needs `A1`.
* `B1` adds `A1` to its own **Dependencies** list.
* `B1` then tells `A1`: "Hey, add me to your **Dependents** list!"
* Later, you change `A1`'s value to `20`.
* `A1` updates itself, then looks at its **Dependents** list. It sees `B1` is waiting.
* `A1` sends a signal: "Hey B1, my value changed, re-evaluate yourself!"
* `B1` repeats the process: `=A1 + 10` -> `20 + 10` -> `30`. It then updates its own `computedValue`. 

### Step 5: Catching Infinite Loops (Circular Dependency)
What if `A1` depends on `B1`, and `B1` depends on `A1`? They will trigger each other to update forever, crashing your app.
* Whenever a cell starts evaluating, mark it as `"calculating..."`.
* If a cell tries to evaluate and sees one of its dependencies is currently marked as `"calculating..."`, it means you've hit an infinite loop. 
* Stop the calculation immediately and throw a `#REF!` or `Error` in the cell.

---

## Part 3: Logic for Optimizing the Solution

As your Excel sheet grows, a simple 2D array and basic UI can become slow. Here is how to optimize for performance.

### Optimization 1: Sparse Data Structures
A 1000x1000 grid in a 2D array creates 1,000,000 objects in memory, even if the user only typed in 5 cells. Most of the sheet is empty!
* **Solution:** Instead of a massive 2D array, use a **Hash Map** (or Dictionary / Object). 
* Use the Cell ID as the key: `{ "A1": { value: "10" }, "Z99": { value: "=A1+5" } }`.
* Only cells with actual data or formulas are stored in memory. The UI simply acts as if the cell is empty if the ID isn't found in the map.

### Optimization 2: Virtualized Rendering (Windowing)
Rendering 10,000 HTML `<input>` elements will freeze the browser, making the site unresponsive. 
* **Solution:** Only render exactly what the user can currently see on their screen (e.g., just 30 rows and 15 columns).
* As the user scrolls, use math to calculate which cells should now be visible and dynamically update those few DOM elements (often called "recycling"). In frameworks like React, libraries like `react-window` handle this effortlessly.

### Optimization 3: Topological Sorting for Updates
If `C1` depends on `B1`, and `B1` depends on `A1`, changing `A1` triggers a cascade. A naive dependency system might accidentally calculate `C1` multiple times as messages propagate.
* **Solution:** Before evaluating a long chain of formulas, use **Topological Sort** (a graph algorithm) to figure out the exact correct order of evaluation (e.g., `A1` -> `B1` -> `C1`).
* This ensures every affected cell is recalculated exactly **once** per change, saving massive amounts of compute time.

### Optimization 4: Web Workers for Heavy Math
If a user updates a cell that cascades through 5,000 other formulas, evaluating them on the main thread will "freeze" the webpage so the user can't scroll or type anymore.
* **Solution:** Move the formula parsing, graphing, and evaluation engine entirely to a **Web Worker**.
* The main thread (UI) simply says, *"Hey Worker, A1 changed to 10!"* and stays perfectly responsive. The worker crunches the math in the background and sends back a message saying, *"Update the UI for B1, C1, and Z99 to these new values."*
