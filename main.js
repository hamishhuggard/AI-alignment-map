let sheetUrl = 'content.csv'
sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRRUv6PC5hC4-VXzQy75DBeywJaiQjU7MPGOoZBat9iJCmQo9Pf0nc2nvAFDfRJmP06WHJEls4RgUw6/pub?gid=1535062603&single=true&output=csv'

d3.csv(sheetUrl).then(function(data) {

    delete data['columns'];
    console.table(data);

    data.map(function(d) {d.x = parseFloat(d.x); d.y = parseFloat(d.y)});

    const X = d3.map(data, d=>d.x);
    const Y = d3.map(data, d=>d.y);
    const xDomain = d3.extent(X);
    const yDomain = d3.extent(Y);
    const xScale = d3.scaleLinear(xDomain, [10,90]);
    const yScale = d3.scaleLinear(yDomain, [10,90]);

    console.log(xScale(0), yScale(0), xDomain, yDomain);

    const divs = d3.select("#map2")
        .selectAll('div')
        .data(data)
        .enter()
        .append('div')
        .attr('style', d => 
            `position: absolute; left: ${xScale(d.x)}%; top: ${yScale(d.y)}%; transform: translateX(-50%);`
        )
        .attr('class', 'draggable')
    divs
            .append('img')
            .attr('src', d => d.logo)
            .attr('width', '30px')
    divs
            .append('br')
    divs
            .append('a')
            .attr('href', d => d.Link)
            .attr('title', d => d.Hovertext)
            .html(d => d.Label);


    $( ".draggable" ).draggable();

});
