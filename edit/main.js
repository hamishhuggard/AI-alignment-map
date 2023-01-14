// Feedback:

let sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUv6PC5hC4-VXzQy75DBeywJaiQjU7MPGOoZBat9iJCmQo9Pf0nc2nvAFDfRJmP06WHJEls4RgUw6/pub?gid=1173866196&single=true&output=csv'

let widthCache = 0;

d3.csv(sheetUrl).then(function(data) {

    d3.select('#loading').remove();
    d3.select('#main-title').remove();

    delete data['columns'];
    delete data[0];

    // delete hidden rows
    data = data.filter(d => d.hide != 'x');

    data.map(function(d) {d.x = parseFloat(d.x); d.y = parseFloat(d.y)});

    console.table(data);

    const xs = d3.map(data, d=>d.x);
    const ys = d3.map(data, d=>d.y);
    const xDomain = d3.extent(xs);
    const yDomain = d3.extent(ys);
    //const xScale = d3.scaleLinear(xDomain, [200,1800]);
    //const yScale = d3.scaleLinear(yDomain, [0,1200]);
    const xScale = d3.scaleLinear([0,1], [0,1]);
    const yScale = d3.scaleLinear([0,1], [0,1]);

    function getWidth(d) {
        const npx = `${d.scale/10*80}px`;

        // if the width is 200px then the widthCache breaks
        if (npx === '200px')
            return '200.5px';

        return npx;
    }

    const divs = d3.select("#map")
        .selectAll("div")
        .data(data)
        .enter()
        .append('div')
        .classed('map-item', true)
        .on('mouseover', function(d){
            const item = d3.select(this)
            const width = item.style('width');

            // a separate mouseover event occurs after the 
            // size change which we want to ignore
            if (width === '200px') return;

            const leftShift = (200 - parseInt(width))/2;

            console.log(item.style('left'))

            widthCache = width;

            item
                .classed('hovered', true)
                .style('width', '200px')
                .style('left', parseInt(item.style('left'))-leftShift + 'px')
        })
        .on('mouseleave', function(d){
            const leftShift = (200 - parseInt(widthCache))/2;
            const item = d3.select(this)
            item
                .classed('hovered', false)
                .style('width', widthCache)
                .style('left', parseInt(item.style('left'))+leftShift + 'px')
        })
        .style('position', 'absolute')
        .style('top', d => `${yScale(d.y)}px`)
        .style('left', d => `${xScale(d.x)}px`)
        .style('width', d => `${d.scale/10*80}px`)
        .style('font-size', d => `${d.scale/10}em`)
        .attr('id', d => d.id)

    divs
        .filter(d => d.y > 880)
        .classed('low-item', true)

    const anchors = divs
        .append('a')
            /*
            .attr('href', d => d.Link)
            */
            .attr('target', '_blank')

    const details = anchors
        .append('div')
        .classed('details', true)

    details
        .append('div')
        .classed('logo-div', true)
        .append('img')
        .attr('src', d => d.logo);


    details
        .append('div')
        .classed('short-label', true)
        .html(d => d.Label);

    details
        .append('div')
        .classed('long-label', true)
        .html(d => d.LongLabel);

    details
        .append('div')
        .classed('description', true)
        .html(d => d.Description);

    $('.map-item').draggable();

});

function logPositions() {
    const x = []
    const y = []
    d3.selectAll('.map-item').each(function() {
        y.push(d3.style(this, 'top').replace('px',''))
        x.push(d3.style(this, 'left').replace('px',''))
    });
    console.log('x positions\n')
    console.log(x.join('\n'));
    console.log('y positions\n')
    console.log(y.join('\n'));
}
document.addEventListener('keydown', function(event) {
    if (event.key === ' ') {
        logPositions()
    }
});
