// Feedback:
// I’d put a red dot on OpenAI and DeepMind to flag that a significant share of their work is likely to be net negative for X-risks. 

let sheetUrl = 'content.csv'
sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUv6PC5hC4-VXzQy75DBeywJaiQjU7MPGOoZBat9iJCmQo9Pf0nc2nvAFDfRJmP06WHJEls4RgUw6/pub?gid=1173866196&single=true&output=csv'

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
    const xScale = d3.scaleLinear(xDomain, [0,100]);
    const yScale = d3.scaleLinear(yDomain, [0,100]);

    const divs = d3.select("#map")
        .selectAll("div")
        .data(data)
        .enter()
        .append('div')
        .classed('map-item', true)
        //.on('mouseover', function(d){
        //    d3.select(this).classed('hovered', true)
        //})
        .on('mouseleave', function(d){
            d3.select(this).classed('hovered', false)
        })
        .style('position', 'absolute')
        .style('top', d => `${yScale(d.y)}%`)
        .style('left', d => `${xScale(d.x)}%`)
        .style('scale', d => d.scale/10)

    const anchors = divs
        .append('a')
            //.attr('href', d => d.Link)
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
        y.push(d3.style(this, 'top').slice(0,-1))
        x.push(d3.style(this, 'left').slice(0,-1))
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
