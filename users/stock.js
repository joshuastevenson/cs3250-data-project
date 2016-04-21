//# dc.js Getting Started and How-To Guide
'use strict';

/* jshint globalstrict: true */
/* global dc,d3,crossfilter,colorbrewer */

// ### Create Chart Objects

// Create chart objects associated with the container elements identified by the css selector.
// Note: It is often a good idea to have these objects accessible at the global scope so that they can be modified or
// filtered by other page controls.


var quarterChart = dc.pieChart('#quarter-chart');
var dayOfWeekChart = dc.rowChart('#day-of-week-chart');

var colorChart = dc.rowChart('#colorchart');
var locChart = dc.rowChart('#locchart');

var volumeChart = dc.barChart('#monthly-volume-chart');
var nasdaqCount = dc.dataCount('.dc-data-count');
var nasdaqTable = dc.dataTable('.dc-data-table');


//var platform



//### Load your data

//Data can be loaded through regular means with your
//favorite javascript library
//
//```javascript
//d3.csv('data.csv', function(data) {...};
//d3.json('data.json', function(data) {...};
//jQuery.getJson('data.json', function(data){...});
//```

//d3.csv('ndx.csv', function (data) {
d3.csv('users.csv', function (data) {
    // Since its a csv file we need to format the data a bit.
    var dateFormat = d3.time.format('%Y-%m-%d %X');
    var numberFormat = d3.format('.2f');

    data.forEach(function (d) {

          //console.log(d.signupdate)
          d.dd = dateFormat.parse(d.signupdate);
          //new Date(d.signupdate)//
          //console.log(d.dd)
          d.month = d3.time.month(d.dd); // pre-calculate month for better performance

    });

    //### Create Crossfilter Dimensions and Groups

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    // Dimension by year
    var yearlyDimension = ndx.dimension(function (d) {
        return d3.time.year(d.dd).getFullYear();
    });
    // Maintain running tallies by year as filters are applied or removed



    // Dimension by full date
    var dateDimension = ndx.dimension(function (d) {
        return d.dd;
    });

    // Dimension by month
    var moveMonths = ndx.dimension(function (d) {
        return d.month;
    });
    // Group by total movement within month
    var monthlyMoveGroup = moveMonths.group().reduceSum(function (d) {
        return d.signupdate;//Math.abs(d.close - d.open);
    });
    // Group by total volume within move, and scale down result

    var volumeByMonthGroup = moveMonths.group().reduceSum(function (d) {
          return 12//d.color;//d.volume / 500000;
      });


    // Summarize volume by quarter
    var quarter = ndx.dimension(function (d) {
        var month = d.dd.getMonth();
        if (month <= 2) {
            return 'Q1';
        } else if (month > 2 && month <= 5) {
            return 'Q2';
        } else if (month > 5 && month <= 8) {
            return 'Q3';
        } else {
            return 'Q4';
        }
    });
    var quarterGroup = quarter.group().reduceSum(function (d) {
        return 20;//d.volume;
    });

    // Counts per weekday
    var dayOfWeek = ndx.dimension(function (d) {
        var day = d.dd.getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return day + '.' + name[day];
    });
    var dayOfWeekGroup = dayOfWeek.group();

    var color = ndx.dimension(function (d) {return d.color});
    var colorGroup = color.group();

    var loc = ndx.dimension(function (d) {return d.location});
    var locGroup = loc.group();



    // #### Pie/Donut Charts


    quarterChart /* dc.pieChart('#quarter-chart', 'chartGroup') */
        .width(180)
        .height(180)
        .radius(80)
        .innerRadius(30)
        .dimension(quarter)
        .group(quarterGroup);

    //#### Row Chart

    // Create a row chart and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Row Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#row-chart)
    dayOfWeekChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
        .width(180)
        .height(180)
        .margins({top: 20, left: 10, right: 10, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeek)
        // Assign colors to each value in the x scale domain
        .ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
        .label(function (d) {
            return d.key.split('.')[1];
        })
        // Title sets the row text
        .title(function (d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(4);

        colorChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
            .width(300)
            .height(300)
            .margins({top: 20, left: 10, right: 10, bottom: 20})
            .group(colorGroup)
            .dimension(color)
            // Assign colors to each value in the x scale domain
            //.ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
            .label(function (d) {
                return d.key;
            })
            // Title sets the row text
            .title(function (d) {
                return d.key + d.value;
            })
            .elasticX(true)
            .xAxis().ticks(4);

            locChart /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
                .width(1500)
                .height(4700)
                .margins({top: 20, left: 10, right: 10, bottom: 20})
                .group(locGroup)
                .dimension(loc)
                // Assign colors to each value in the x scale domain
                //.ordinalColors(['#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#dadaeb'])
                .label(function (d) {
                    return  d.key;
                })
                // Title sets the row text
                .title(function (d) {
                    return d.key + " " +d.value;
                })
                .elasticX(true)
                .xAxis().ticks(4);

    //#### Bar Chart

    // Create a bar chart and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Bar Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#bar-chart)

    // fluctuationChart /* dc.barChart('#volume-month-chart', 'chartGroup') */
    //     .width(420)
    //     .height(180)
    //     .margins({top: 10, right: 50, bottom: 30, left: 40})
    //     .dimension(fluctuation)
    //     .group(fluctuationGroup)
    //     .elasticY(true)
    //     // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
    //     .centerBar(true)
    //     // (_optional_) set gap between bars manually in px, `default=2`
    //     .gap(1)
    //     // (_optional_) set filter brush rounding
    //     .round(dc.round.floor)
    //     .alwaysUseRounding(true)
    //     .x(d3.scale.linear().domain([-25, 25]))
    //     .renderHorizontalGridLines(true)
    //     // Customize the filter displayed in the control span
    //     .filterPrinter(function (filters) {
    //         var filter = filters[0], s = '';
    //         s += numberFormat(filter[0]) + '% -> ' + numberFormat(filter[1]) + '%';
    //         return s;
    //     });
    //
    // // Customize axes
    // fluctuationChart.xAxis().tickFormat(
    //     function (v) { return v + '%'; });
    // fluctuationChart.yAxis().ticks(5);

    //#### Stacked Area Chart

    //Specify an area chart by using a line chart with `.renderArea(true)`.
    // <br>API: [Stack Mixin](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#stack-mixin),


    //#### Range Chart


    //month chart

    // Since this bar chart is specified as "range chart" for the area chart, its brush extent
    // will always match the zoom of the area chart.
    volumeChart.width(990) /* dc.barChart('#monthly-volume-chart', 'chartGroup'); */
        .height(200)
        .margins({top: 0, right: 50, bottom: 20, left: 40})
        .dimension(moveMonths)
        .group(volumeByMonthGroup)
        .centerBar(true)
        .gap(1)
        .x(d3.time.scale().domain([new Date(2014, 0, 1), new Date(2017, 1, 1)]))
        .round(d3.time.month.round)
        .alwaysUseRounding(true)
        .xUnits(d3.time.months)
        //.mouseZoomable(true)
        .title(function (d) {
            return d.value;
        });

    //#### Data Count

    // Create a data count widget and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Data Count Widget](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#data-count-widget)
    //
    //```html
    //<div class='dc-data-count'>
    //  <span class='filter-count'></span>
    //  selected out of <span class='total-count'></span> records.
    //</div>
    //```

    nasdaqCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
        .dimension(ndx)
        .group(all)
        // (_optional_) `.html` sets different html when some records or all records are selected.
        // `.html` replaces everything in the anchor with the html given using the following function.
        // `%filter-count` and `%total-count` are replaced with the values obtained.
        .html({
            some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
            all: 'All records selected. Please click on the graph to apply filters.'
        });

    //#### Data Table

    // Create a data table widget and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Data Table Widget](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#data-table-widget)
    //
    // You can statically define the headers like in
    //
    // ```html
    //    <!-- anchor div for data table -->
    //    <div id='data-table'>
    //       <!-- create a custom header -->
    //       <div class='header'>
    //           <span>Date</span>
    //           <span>Open</span>
    //           <span>Close</span>
    //           <span>Change</span>
    //           <span>Volume</span>
    //       </div>
    //       <!-- data rows will filled in here -->
    //    </div>
    // ```
    // or do it programmatically using `.columns()`.

    nasdaqTable /* dc.dataTable('.dc-data-table', 'chartGroup') */
        .dimension(dateDimension)
        // Data table does not use crossfilter group but rather a closure
        // as a grouping function
        .group(function (d) {
            var format = d3.format('02d');
            return d.dd.getFullYear() + '/' + format((d.dd.getMonth() + 1));
        })
        // (_optional_) max number of records to be shown, `default = 25`
        .size(50)
        // There are several ways to specify the columns; see the data-table documentation.
        // This code demonstrates generating the column header automatically based on the columns.
        .columns([
            // Use the `d.date` field; capitalized automatically
            'date',
            // Use `d.open`, `d.close`
            'name',
            'color',
              'location'
        ])

        // (_optional_) sort using the given field, `default = function(d){return d;}`
        .sortBy(function (d) {
            return d.dd;
        })
        // (_optional_) sort order, `default = d3.ascending`
        .order(d3.ascending)
        // (_optional_) custom renderlet to post-process chart using [D3](http://d3js.org)
        .on('renderlet', function (table) {
            table.selectAll('.dc-table-group').classed('info', true);
        });



    //#### Rendering

    //simply call `.renderAll()` to render all charts on the page
    dc.renderAll();
    /*
    // Or you can render charts belonging to a specific chart group
    dc.renderAll('group');
    // Once rendered you can call `.redrawAll()` to update charts incrementally when the data
    // changes, without re-rendering everything
    dc.redrawAll();
    // Or you can choose to redraw only those charts associated with a specific chart group
    dc.redrawAll('group');
    */

});

//#### Versions

//Determine the current version of dc with `dc.version`
d3.selectAll('#version').text(dc.version);

// Determine latest stable version in the repo via Github API
d3.json('https://api.github.com/repos/dc-js/dc.js/releases/latest', function (error, latestRelease) {
    /*jshint camelcase: false */
    d3.selectAll('#latest').text(latestRelease.tag_name); /* jscs:disable */
});
