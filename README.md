# T05-multi-chart-webpage
# Multi-Chart Data Visualization Dashboard

A responsive, single-page dashboard built with **HTML, CSS, and D3.js**. Visualizes TV energy consumption and historical spot power prices through four interactive charts.

## Features
- **Charts**: Scatter Plot, Donut Chart, Bar Chart, Line Chart.
- **Interactive Tooltips**: Hover to see detailed data.

## Charts
- **Scatter Plot**: Energy (kWh) vs Star Rating  
- **Donut Chart**: Energy by Screen Technology (All TVs)  
- **Bar Chart**: Energy for 55" TVs by Screen Technology  
- **Line Chart**: Spot Power Prices ($/MWh, 1998–2024)

## Project Structure
index.html - Main page
scatter.js - Scatter Plot
donut.js - Donut Chart
bar.js - Bar Chart
line.js - Line Chart
data/ - CSV files

## Run Locally
```bash
cd your-project-folder/
python -m http.server 8000

Open http://localhost:8000
in a browser to explore the dashboard.
