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

const CSV_URL = 'https://docs.google.com/spreadsheets/d/16CjyorSwrzVsMXtdHecuu-C6HWVYqjJbgwG0p3ZFlWg/export?format=csv&gid=1371825706&single=true&output=csv'

function grid() {
  const gridGroup = d3.select('#gridGroup');
  const gridVisible = gridGroup.style('display') !== 'none';
  gridGroup.style('display', gridVisible ? 'none' : '');
}

function updateInfoBox(data) {
  const infoBoxRow = data.find(row => row.LongLabel === 'Infobox');
  if (infoBoxRow && infoBoxRow.Description) {
    d3.select('#info-box').html(infoBoxRow.Description);
  }
}

(async () => {
  const zoom = d3.zoom()
    .scaleExtent([0.8, 3])
    .on('zoom', zoomed);

  const svg = d3.select('#grid')
    .append('svg')
    .attr('width', viewportWidth)
    .attr('height', viewportHeight)
    .call(zoom)
    .append('g');

  // Add blurred background image
  const avifIsSupported = await isImageTypeSupported('image/avif');
  const backgroundImageUrl = await (async () => {
    if (avifIsSupported) return '/background.avif';
    else if (await isImageTypeSupported('image/webp')) return '/background.webp';
    else return '/background.jpg';
  })();

  const backgroundWidth = 60 * gridSize;
  const backgroundHeight = (1950 / 3104) * 60 * gridSize;

  const secondBackgroundScale = 1.25;
  
  svg.append('image')
    .attr('xlink:href', backgroundImageUrl)
    .attr('x', xOffset) // - backgroundWidth * 0.5) // Center the blurred image
    .attr('y', -backgroundHeight * (secondBackgroundScale-1)/2) // Center the blurred image
    .attr('width', backgroundWidth * secondBackgroundScale) // Make the blurred image larger
    .attr('height', backgroundHeight * secondBackgroundScale) // Make the blurred image larger
    .attr('class', 'blurred-background'); // Add a class for styling

  // Add main background image
  svg.append('image')
    .attr('xlink:href', backgroundImageUrl)
    .attr('x', xOffset)
    .attr('y', 0)
    .attr('width', backgroundWidth)
    .attr('height', backgroundHeight);

  /*
  // Add background image
  const avifIsSupported = await isImageTypeSupported('image/avif')
  svg.append('image')
    .attr('xlink:href', await (async () => {
      if (avifIsSupported) return '/background.avif';
      else if (await isImageTypeSupported('image/webp')) return '/background.webp';
      else return '/background.jpg';
    })())
    .attr('x', xOffset)
    .attr('y', 0)
    .attr('width', 60 * gridSize)
    .attr('height', 1950 / 3104 * 60 * gridSize);
    */

  const gridGroup = svg.append('g')
    .attr('transform', `translate(${xOffset}, 0)`)
    .attr('id', 'gridGroup');

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



  drawGrid();
  grid();

  // Load processed image formats
  const processedImageFormats = await (await fetch('/logos/processed-formats.json')).json()


  // Read CSV data and place a red square at the grid coordinates
  d3.csv(CSV_URL)
    .then(data => {
      updateInfoBox(data); // Add this line
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
    const scale = (+row.scale || 1) * 0.55;
    let logo = row.logo;
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

    // Replace logo URL with processed version
    const PREFIX = '/logos/'
    const extension = '.' + logo.split('.').pop()
    if (avifIsSupported && logo.startsWith(PREFIX) && processedImageFormats.includes(extension)) {
      const name = logo.substring(PREFIX.length, logo.length - extension.length)
      logo = `${PREFIX}avif/${name}.avif`
    }

    // Add the label
    const labelText = label;
    const labelMaxWidth = gridSize * scale * 2;
    const fontsize = gridSize * scale * 0.3;

    const itemContainer = contentGroup.append('foreignObject')
      .attr('x', gridSize * scale / 2 - labelMaxWidth / 2)
      .attr('y', 0)
      .attr('width', labelMaxWidth)
      .attr('font-size', fontsize)
      .attr('height', gridSize * scale + 5 + 30);

    const outerDiv = itemContainer.append('xhtml:div')
      .attr('class', 'labelContainer')
      .style('align-items', 'center');

    outerDiv.append('xhtml:img')
      .attr('alt', 'Image description')
      .attr('src', logo)
      .attr('style', `max-width: ${labelMaxWidth*0.9}px; max-height: ${labelMaxWidth*0.5}px`);

    outerDiv.append('xhtml:div')
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
})();

/**
 * 
 * @param {string} mimeType
 * @returns {Promise<boolean>}
 */
