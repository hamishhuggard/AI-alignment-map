const viewportWidth = window.innerWidth;
const viewportHeight = window.innerHeight;
const viewportRatio = viewportHeight / viewportWidth;
const viewportWidthInGridWidths = viewportRatio > 1 ? 21 : 59;
const gridSize = viewportWidth / viewportWidthInGridWidths;
const maxXCoord = 59;
const maxYCoord = 37;
const gridWidth = (maxXCoord + 1) * gridSize;
const gridHeight = (maxYCoord + 1) * gridSize;
const xOffset = (viewportWidthInGridWidths / 2 - 30) * gridSize;

const zoom = d3.zoom()
  .scaleExtent([0.8, 3])
  .on('zoom', zoomed);

const svg = d3.select('#grid')
  .append('svg')
    .attr('width', viewportWidth)
    .attr('height', viewportHeight)
    .call(zoom)
  .append('g');

// Add background image
svg.append('image')
  .attr('xlink:href', '/background.jpg')
  .attr('x', xOffset)
  .attr('y', 0)
  .attr('width', 60 * gridSize)
  .attr('height', 1950 / 3104 * 60 * gridSize);

const gridGroup = svg.append('g')
  .attr('transform', `translate(${xOffset}, 0)`);

function drawGrid() {
  const rangeX = d3.range(0, gridWidth, gridSize);
  const rangeY = d3.range(0, gridHeight, gridSize);

  rangeX.forEach(x => {
    gridGroup.append('line')
      .attr('x1', x)
      .attr('y1', 0)
      .attr('x2', x)
      .attr('y2', gridHeight)
      .attr('class', 'grid-line');
  });

  rangeY.forEach(y => {
    gridGroup.append('line')
      .attr('x1', 0)
      .attr('y1', y)
      .attr('x2', gridWidth)
      .attr('y2', y)
      .attr('class', 'grid-line');
  });

  rangeX.forEach((x, i) => {
    rangeY.forEach((y, j) => {
      gridGroup.append('text')
        .attr('x', x + 2)
        .attr('y', y + 12)
        .attr('class', 'grid-text')
        .text(`${i},${j}`);
    });
  });
}

function zoomed(event) {
  svg.attr('transform', event.transform);
}

function grid() {
  const gridVisible = gridGroup.style('display') !== 'none';
  gridGroup.style('display', gridVisible ? 'none' : '');
}

drawGrid();
grid();


// Read CSV data and place a red square at the grid coordinates
d3.csv('https://docs.google.com/spreadsheets/d/16CjyorSwrzVsMXtdHecuu-C6HWVYqjJbgwG0p3ZFlWg/export?format=csv&gid=1371825706&single=true&output=csv')
  .then(data => {
    data.forEach(drawSquare);
    setMapItemOrigins();
  });

// Add the tooltip
const tooltip = d3.select('#tooltip');

function drawSquare(row) {
  // Discard rows with 'x' in the 'hide' column
  if (row.hide === 'x') return;

  const x = +row.x;
  const y = +row.y;
  const scale = +row.scale || 1;
  const logo = row.logo;
  const label = row.Label;
  const link = row.Link;
  const longLabel = row.LongLabel;
  const description = row.Description;

  // Calculate the position in pixels
  const xPos = x * gridSize + xOffset;
  const yPos = y * gridSize;

  // Create a group for the logo, label, and link
  const itemGroup = svg.append('g')
    .attr('transform', `translate(${xPos}, ${yPos})`);

  // Create a link
  const itemLink = itemGroup.append('a')
    .attr('href', link)
    .attr('target', '_blank');

  // Create a group for the logo and label, and apply hover effect to it
  const contentGroup = itemLink.append('g')
    .attr('class', 'mapItem')
    .on('mouseover', function (event, row) {
    tooltip
    .style('left', (event.pageX + 10) + 'px')
    .style('top', (event.pageY + 10) + 'px')
    .html(`<strong>${longLabel}</strong><br>${description}`)
    .classed('hidden', false);
    })
    .on('mouseout', function () {
    tooltip.classed('hidden', true);
    });

  // Add the image
  contentGroup.append('image')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', gridSize * scale)
    .attr('height', gridSize * scale)
    .attr('xlink:href', logo);

  // Add the label
  const labelText = label;
  const labelMaxWidth = gridSize * scale * 2;
  const fontsize = gridSize * scale * 0.3;

  contentGroup.append('foreignObject')
    .attr('x', gridSize * scale / 2 - labelMaxWidth / 2)
    .attr('y', gridSize * scale + 5)
    .attr('width', labelMaxWidth)
    .attr('font-size', fontsize)
    .attr('height', 30)
    .append('xhtml:div')
    .attr('class', 'labelContainer')
    .text(labelText);

}

function setMapItemOrigins() {
    // Set transform-origin dynamically for each square
    d3.selectAll('.mapItem')
      .each(function () {
        const xPos = d3.select(this).attr('data-x');
        const yPos = d3.select(this).attr('data-y');
        d3.select(this).style('transform-origin', `${xPos}px ${yPos}px`);
      });
}

