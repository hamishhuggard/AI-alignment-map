const sheetUrl = 'https://docs.google.com/spreadsheets/d/16CjyorSwrzVsMXtdHecuu-C6HWVYqjJbgwG0p3ZFlWg/export?format=csv&gid=1371825706&single=true&output=csv'
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

    const sections = [];
    new Set(d3.map(data, d=>d.tags)).forEach(x =>
        sections.push(
        {
            title: x,
            id: x.replace(/ /g, "-")
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
        sectionDivs = gridSlots.filter(d => d.tags === section.title);
        $( sectionDivs.nodes() ).appendTo( $(`#${section.id}`) );
    }

});
