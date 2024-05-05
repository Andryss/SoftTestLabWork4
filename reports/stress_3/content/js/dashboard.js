/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 82.07885304659499, "KoPercent": 17.921146953405017};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4103942652329749, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4103942652329749, 500, 1500, "HTTP Request 3"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 558, 100, 17.921146953405017, 572.8243727598569, 521, 742, 568.0, 612.1, 629.05, 705.6899999999997, 4.670198608983855, 1.053531131518819, 0.7160363101664701], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["HTTP Request 3", 558, 100, 17.921146953405017, 572.8243727598569, 521, 742, 568.0, 612.1, 629.05, 705.6899999999997, 4.670198608983855, 1.053531131518819, 0.7160363101664701], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 603 milliseconds, but should not have lasted longer than 600 milliseconds.", 5, 5.0, 0.8960573476702509], "isController": false}, {"data": ["The operation lasted too long: It took 711 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 609 milliseconds, but should not have lasted longer than 600 milliseconds.", 3, 3.0, 0.5376344086021505], "isController": false}, {"data": ["The operation lasted too long: It took 614 milliseconds, but should not have lasted longer than 600 milliseconds.", 3, 3.0, 0.5376344086021505], "isController": false}, {"data": ["The operation lasted too long: It took 688 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 619 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 2.0, 0.35842293906810035], "isController": false}, {"data": ["The operation lasted too long: It took 613 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 692 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 717 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 624 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 2.0, 0.35842293906810035], "isController": false}, {"data": ["The operation lasted too long: It took 650 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 651 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 615 milliseconds, but should not have lasted longer than 600 milliseconds.", 3, 3.0, 0.5376344086021505], "isController": false}, {"data": ["The operation lasted too long: It took 647 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 699 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 622 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 602 milliseconds, but should not have lasted longer than 600 milliseconds.", 3, 3.0, 0.5376344086021505], "isController": false}, {"data": ["The operation lasted too long: It took 608 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 2.0, 0.35842293906810035], "isController": false}, {"data": ["The operation lasted too long: It took 679 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 605 milliseconds, but should not have lasted longer than 600 milliseconds.", 4, 4.0, 0.7168458781362007], "isController": false}, {"data": ["The operation lasted too long: It took 628 milliseconds, but should not have lasted longer than 600 milliseconds.", 3, 3.0, 0.5376344086021505], "isController": false}, {"data": ["The operation lasted too long: It took 673 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 625 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 644 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 702 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 612 milliseconds, but should not have lasted longer than 600 milliseconds.", 6, 6.0, 1.075268817204301], "isController": false}, {"data": ["The operation lasted too long: It took 642 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 621 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 2.0, 0.35842293906810035], "isController": false}, {"data": ["The operation lasted too long: It took 606 milliseconds, but should not have lasted longer than 600 milliseconds.", 8, 8.0, 1.4336917562724014], "isController": false}, {"data": ["The operation lasted too long: It took 659 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 638 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 652 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 617 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 658 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 2.0, 0.35842293906810035], "isController": false}, {"data": ["The operation lasted too long: It took 611 milliseconds, but should not have lasted longer than 600 milliseconds.", 3, 3.0, 0.5376344086021505], "isController": false}, {"data": ["The operation lasted too long: It took 616 milliseconds, but should not have lasted longer than 600 milliseconds.", 3, 3.0, 0.5376344086021505], "isController": false}, {"data": ["The operation lasted too long: It took 674 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 648 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 633 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 719 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 2.0, 0.35842293906810035], "isController": false}, {"data": ["The operation lasted too long: It took 630 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 678 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 600 milliseconds.", 5, 5.0, 0.8960573476702509], "isController": false}, {"data": ["The operation lasted too long: It took 626 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 643 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 629 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 2.0, 0.35842293906810035], "isController": false}, {"data": ["The operation lasted too long: It took 607 milliseconds, but should not have lasted longer than 600 milliseconds.", 5, 5.0, 0.8960573476702509], "isController": false}, {"data": ["The operation lasted too long: It took 604 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 620 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 2.0, 0.35842293906810035], "isController": false}, {"data": ["The operation lasted too long: It took 623 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}, {"data": ["The operation lasted too long: It took 742 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 1.0, 0.17921146953405018], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 558, 100, "The operation lasted too long: It took 606 milliseconds, but should not have lasted longer than 600 milliseconds.", 8, "The operation lasted too long: It took 612 milliseconds, but should not have lasted longer than 600 milliseconds.", 6, "The operation lasted too long: It took 603 milliseconds, but should not have lasted longer than 600 milliseconds.", 5, "The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 600 milliseconds.", 5, "The operation lasted too long: It took 607 milliseconds, but should not have lasted longer than 600 milliseconds.", 5], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["HTTP Request 3", 558, 100, "The operation lasted too long: It took 606 milliseconds, but should not have lasted longer than 600 milliseconds.", 8, "The operation lasted too long: It took 612 milliseconds, but should not have lasted longer than 600 milliseconds.", 6, "The operation lasted too long: It took 603 milliseconds, but should not have lasted longer than 600 milliseconds.", 5, "The operation lasted too long: It took 601 milliseconds, but should not have lasted longer than 600 milliseconds.", 5, "The operation lasted too long: It took 607 milliseconds, but should not have lasted longer than 600 milliseconds.", 5], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
