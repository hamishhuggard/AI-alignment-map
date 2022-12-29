// I’d put a red dot on OpenAI and DeepMind to flag that a significant share of their work is likely to be net negative for X-risks. 


let sheetUrl = 'content.csv'
sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUv6PC5hC4-VXzQy75DBeywJaiQjU7MPGOoZBat9iJCmQo9Pf0nc2nvAFDfRJmP06WHJEls4RgUw6/pub?gid=1173866196&single=true&output=csv'
console.log(sheetUrl);

d3.csv(sheetUrl).then(function(data) {

    d3.select('#loading').remove();

    delete data['columns'];

    // delete hidden rows
    data = data.filter(d => d.hide != 'x');

    data.map(function(d) {d.x = parseFloat(d.x); d.y = parseFloat(d.y)});

    console.table(data);

    const X = d3.map(data, d=>d.x);
    const Y = d3.map(data, d=>d.y);
    const xDomain = d3.extent(X);
    const yDomain = d3.extent(Y);
    const xScale = d3.scaleLinear(xDomain, [5,80]);
    const yScale = d3.scaleLinear(yDomain, [10,90]);

    const subcat2section = {};
    data.forEach(x => {
        subcat2section[x.section] = x.category;
    })
    console.log(subcat2section);

    const sections = [];
    new Set(d3.map(data, d=>d.section)).forEach(x =>
        sections.push(
        {
            title: x,
            id: x.split(' ')[0].toLowerCase()
        }
        )
    );

    let sectionDivs = d3.select("#map")
        .selectAll('div')
        .data(sections)
        .enter()
        .append('div');

    let sectionDivs2 = d3.select("#map")
        .selectAll('div')
        .data(sections)
        .enter()
        .append('div');

    sectionDivs
        .append('div')
        .classed('category-heading', true)
        .html(d => d.title);

    sectionDivs
        .append('div')
        .classed('category', true)
        .attr('id', d => d.id);

    console.table(data);
    console.log(data);

    const gridSlots = d3.select("#map")
        .data(data)
        .enter()
        .append('div')
        .classed('grid-slot', true)

    console.log(gridSlots);

    const divs = gridSlots
        .append('div')
        .classed('map-item', true)
        .on('mouseover', function(d){
            d3.select(this).classed('hovered', true)
        })
        .on('mouseleave', function(d){
            d3.select(this).classed('hovered', false)
        })

    const anchors = divs
        .append('a')
            .attr('href', d => d.Link)
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


    for (let section of sections) {
        sectionDivs = gridSlots.filter(d => d.section === section.title);
        $( sectionDivs.nodes() ).appendTo( $(`#${section.id}`) );
    }

});
