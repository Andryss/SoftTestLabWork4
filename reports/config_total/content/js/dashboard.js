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

    var data = {"OkPercent": 33.27777777777778, "KoPercent": 66.72222222222223};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1663888888888889, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "HTTP Request 2"], "isController": false}, {"data": [0.0, 500, 1500, "HTTP Request 1"], "isController": false}, {"data": [0.49916666666666665, 500, 1500, "HTTP Request 3"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1800, 1201, 66.72222222222223, 878.6038888888887, 521, 1307, 943.0, 1144.0, 1148.0, 1160.0, 3.2087334594246744, 0.7238451456319333, 0.49196401672819706], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["HTTP Request 2", 600, 600, 100.0, 945.7016666666672, 922, 1307, 943.0, 952.0, 959.0, 976.99, 3.3285439284584957, 0.7508727026112427, 0.5103333952812342], "isController": false}, {"data": ["HTTP Request 1", 600, 600, 100.0, 1144.4433333333354, 1121, 1198, 1143.0, 1151.0, 1156.0, 1176.0, 3.325131342688036, 0.7501028712509145, 0.5098101765644744], "isController": false}, {"data": ["HTTP Request 3", 600, 1, 0.16666666666666666, 545.6666666666669, 521, 903, 543.0, 552.0, 559.9499999999999, 582.94, 3.3362803810032196, 0.7526179375114684, 0.5115195506030327], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 1,129 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 1,154 milliseconds, but should not have lasted longer than 600 milliseconds.", 4, 0.33305578684429643, 0.2222222222222222], "isController": false}, {"data": ["The operation lasted too long: It took 1,139 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,134 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 944 milliseconds, but should not have lasted longer than 600 milliseconds.", 60, 4.995836802664447, 3.3333333333333335], "isController": false}, {"data": ["The operation lasted too long: It took 1,176 milliseconds, but should not have lasted longer than 600 milliseconds.", 4, 0.33305578684429643, 0.2222222222222222], "isController": false}, {"data": ["The operation lasted too long: It took 976 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 1,144 milliseconds, but should not have lasted longer than 600 milliseconds.", 53, 4.412989175686928, 2.9444444444444446], "isController": false}, {"data": ["The operation lasted too long: It took 929 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,174 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,142 milliseconds, but should not have lasted longer than 600 milliseconds.", 172, 14.321398834304746, 9.555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 939 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 936 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,161 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 956 milliseconds, but should not have lasted longer than 600 milliseconds.", 4, 0.33305578684429643, 0.2222222222222222], "isController": false}, {"data": ["The operation lasted too long: It took 1,164 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 959 milliseconds, but should not have lasted longer than 600 milliseconds.", 7, 0.5828476269775187, 0.3888888888888889], "isController": false}, {"data": ["The operation lasted too long: It took 949 milliseconds, but should not have lasted longer than 600 milliseconds.", 10, 0.832639467110741, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 946 milliseconds, but should not have lasted longer than 600 milliseconds.", 25, 2.0815986677768525, 1.3888888888888888], "isController": false}, {"data": ["The operation lasted too long: It took 1,132 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 969 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,189 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,162 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 973 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,158 milliseconds, but should not have lasted longer than 600 milliseconds.", 4, 0.33305578684429643, 0.2222222222222222], "isController": false}, {"data": ["The operation lasted too long: It took 1,172 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,178 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,018 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,152 milliseconds, but should not have lasted longer than 600 milliseconds.", 8, 0.6661115736885929, 0.4444444444444444], "isController": false}, {"data": ["The operation lasted too long: It took 926 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 963 milliseconds, but should not have lasted longer than 600 milliseconds.", 3, 0.2497918401332223, 0.16666666666666666], "isController": false}, {"data": ["The operation lasted too long: It took 1,153 milliseconds, but should not have lasted longer than 600 milliseconds.", 5, 0.4163197335553705, 0.2777777777777778], "isController": false}, {"data": ["The operation lasted too long: It took 964 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 925 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 1,198 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,163 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,149 milliseconds, but should not have lasted longer than 600 milliseconds.", 13, 1.0824313072439633, 0.7222222222222222], "isController": false}, {"data": ["The operation lasted too long: It took 954 milliseconds, but should not have lasted longer than 600 milliseconds.", 4, 0.33305578684429643, 0.2222222222222222], "isController": false}, {"data": ["The operation lasted too long: It took 974 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,143 milliseconds, but should not have lasted longer than 600 milliseconds.", 134, 11.15736885928393, 7.444444444444445], "isController": false}, {"data": ["The operation lasted too long: It took 1,188 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,159 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 970 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 903 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 945 milliseconds, but should not have lasted longer than 600 milliseconds.", 27, 2.2481265611990007, 1.5], "isController": false}, {"data": ["The operation lasted too long: It took 1,175 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,155 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 923 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 1,123 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 955 milliseconds, but should not have lasted longer than 600 milliseconds.", 6, 0.4995836802664446, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 1,135 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,138 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 940 milliseconds, but should not have lasted longer than 600 milliseconds.", 3, 0.2497918401332223, 0.16666666666666666], "isController": false}, {"data": ["The operation lasted too long: It took 1,145 milliseconds, but should not have lasted longer than 600 milliseconds.", 34, 2.8309741881765196, 1.8888888888888888], "isController": false}, {"data": ["The operation lasted too long: It took 933 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 953 milliseconds, but should not have lasted longer than 600 milliseconds.", 5, 0.4163197335553705, 0.2777777777777778], "isController": false}, {"data": ["The operation lasted too long: It took 950 milliseconds, but should not have lasted longer than 600 milliseconds.", 8, 0.6661115736885929, 0.4444444444444444], "isController": false}, {"data": ["The operation lasted too long: It took 930 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 1,148 milliseconds, but should not have lasted longer than 600 milliseconds.", 7, 0.5828476269775187, 0.3888888888888889], "isController": false}, {"data": ["The operation lasted too long: It took 1,167 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 972 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 975 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 943 milliseconds, but should not have lasted longer than 600 milliseconds.", 125, 10.407993338884262, 6.944444444444445], "isController": false}, {"data": ["The operation lasted too long: It took 1,147 milliseconds, but should not have lasted longer than 600 milliseconds.", 13, 1.0824313072439633, 0.7222222222222222], "isController": false}, {"data": ["The operation lasted too long: It took 1,126 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 952 milliseconds, but should not have lasted longer than 600 milliseconds.", 7, 0.5828476269775187, 0.3888888888888889], "isController": false}, {"data": ["The operation lasted too long: It took 937 milliseconds, but should not have lasted longer than 600 milliseconds.", 6, 0.4995836802664446, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 1,307 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 941 milliseconds, but should not have lasted longer than 600 milliseconds.", 61, 5.07910074937552, 3.388888888888889], "isController": false}, {"data": ["The operation lasted too long: It took 1,130 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 948 milliseconds, but should not have lasted longer than 600 milliseconds.", 9, 0.7493755203996669, 0.5], "isController": false}, {"data": ["The operation lasted too long: It took 927 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 1,137 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,151 milliseconds, but should not have lasted longer than 600 milliseconds.", 11, 0.9159034138218152, 0.6111111111111112], "isController": false}, {"data": ["The operation lasted too long: It took 1,131 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 947 milliseconds, but should not have lasted longer than 600 milliseconds.", 21, 1.7485428809325563, 1.1666666666666667], "isController": false}, {"data": ["The operation lasted too long: It took 968 milliseconds, but should not have lasted longer than 600 milliseconds.", 4, 0.33305578684429643, 0.2222222222222222], "isController": false}, {"data": ["The operation lasted too long: It took 995 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,157 milliseconds, but should not have lasted longer than 600 milliseconds.", 4, 0.33305578684429643, 0.2222222222222222], "isController": false}, {"data": ["The operation lasted too long: It took 1,136 milliseconds, but should not have lasted longer than 600 milliseconds.", 3, 0.2497918401332223, 0.16666666666666666], "isController": false}, {"data": ["The operation lasted too long: It took 942 milliseconds, but should not have lasted longer than 600 milliseconds.", 154, 12.822647793505412, 8.555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 958 milliseconds, but should not have lasted longer than 600 milliseconds.", 5, 0.4163197335553705, 0.2777777777777778], "isController": false}, {"data": ["The operation lasted too long: It took 1,141 milliseconds, but should not have lasted longer than 600 milliseconds.", 58, 4.8293089092422985, 3.2222222222222223], "isController": false}, {"data": ["The operation lasted too long: It took 931 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,156 milliseconds, but should not have lasted longer than 600 milliseconds.", 5, 0.4163197335553705, 0.2777777777777778], "isController": false}, {"data": ["The operation lasted too long: It took 922 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 961 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,121 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,150 milliseconds, but should not have lasted longer than 600 milliseconds.", 10, 0.832639467110741, 0.5555555555555556], "isController": false}, {"data": ["The operation lasted too long: It took 1,146 milliseconds, but should not have lasted longer than 600 milliseconds.", 14, 1.1656952539550374, 0.7777777777777778], "isController": false}, {"data": ["The operation lasted too long: It took 1,160 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 971 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 957 milliseconds, but should not have lasted longer than 600 milliseconds.", 3, 0.2497918401332223, 0.16666666666666666], "isController": false}, {"data": ["The operation lasted too long: It took 1,140 milliseconds, but should not have lasted longer than 600 milliseconds.", 7, 0.5828476269775187, 0.3888888888888889], "isController": false}, {"data": ["The operation lasted too long: It took 977 milliseconds, but should not have lasted longer than 600 milliseconds.", 2, 0.16652789342214822, 0.1111111111111111], "isController": false}, {"data": ["The operation lasted too long: It took 938 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 932 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 951 milliseconds, but should not have lasted longer than 600 milliseconds.", 6, 0.4995836802664446, 0.3333333333333333], "isController": false}, {"data": ["The operation lasted too long: It took 1,098 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 1,127 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}, {"data": ["The operation lasted too long: It took 967 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, 0.08326394671107411, 0.05555555555555555], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1800, 1201, "The operation lasted too long: It took 1,142 milliseconds, but should not have lasted longer than 600 milliseconds.", 172, "The operation lasted too long: It took 942 milliseconds, but should not have lasted longer than 600 milliseconds.", 154, "The operation lasted too long: It took 1,143 milliseconds, but should not have lasted longer than 600 milliseconds.", 134, "The operation lasted too long: It took 943 milliseconds, but should not have lasted longer than 600 milliseconds.", 125, "The operation lasted too long: It took 941 milliseconds, but should not have lasted longer than 600 milliseconds.", 61], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["HTTP Request 2", 600, 600, "The operation lasted too long: It took 942 milliseconds, but should not have lasted longer than 600 milliseconds.", 154, "The operation lasted too long: It took 943 milliseconds, but should not have lasted longer than 600 milliseconds.", 125, "The operation lasted too long: It took 941 milliseconds, but should not have lasted longer than 600 milliseconds.", 61, "The operation lasted too long: It took 944 milliseconds, but should not have lasted longer than 600 milliseconds.", 60, "The operation lasted too long: It took 945 milliseconds, but should not have lasted longer than 600 milliseconds.", 27], "isController": false}, {"data": ["HTTP Request 1", 600, 600, "The operation lasted too long: It took 1,142 milliseconds, but should not have lasted longer than 600 milliseconds.", 172, "The operation lasted too long: It took 1,143 milliseconds, but should not have lasted longer than 600 milliseconds.", 134, "The operation lasted too long: It took 1,141 milliseconds, but should not have lasted longer than 600 milliseconds.", 58, "The operation lasted too long: It took 1,144 milliseconds, but should not have lasted longer than 600 milliseconds.", 53, "The operation lasted too long: It took 1,145 milliseconds, but should not have lasted longer than 600 milliseconds.", 34], "isController": false}, {"data": ["HTTP Request 3", 600, 1, "The operation lasted too long: It took 903 milliseconds, but should not have lasted longer than 600 milliseconds.", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
