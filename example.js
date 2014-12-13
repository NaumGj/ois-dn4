function vizualizacija(data) {
    var dataTable = [];
    for (var i = 0; i < 25; i++) {
        if(data[i] !== null) {
            if(i%5 == 0) {
                if(data[i] >= 36 && data[i] <= 37.5){
                    dataTable[i] = {title: i, value: 1};
                }else if(data[i] < 35 || data[i] >= 40){
                    dataTable[i] = {title: i, value: 10};
                }else if(data[i] >= 35 && data[i] < 35.5){
                    dataTable[i] = {title: i, value: 7};
                }else if(data[i] >= 35.5 && data[i] < 36){
                    dataTable[i] = {title: i, value: 4};
                }else if(data[i] > 37.5 && data[i] <= 38){
                    dataTable[i] = {title: i, value: 4};
                }else if(data[i] > 38 && data[i] <= 38.5){
                    dataTable[i] = {title: i, value: 6};
                }else if(data[i] > 38.5 && data[i] <= 39){
                    dataTable[i] = {title: i, value: 8};
                }else if(data[i] > 39.5 && data[i] < 40){
                    dataTable[i] = {title: i, value: 9};
                }else if(data[i] >= 40){
                    dataTable[i] = {title: i, value: 10};
                }
            }else if(i%5 == 1){
                if(data[i] >= 90 && data[i] <= 120){
                    dataTable[i] = {title: i, value: 1};
                }else if(data[i] <= 80 || data[i] >= 180){
                    dataTable[i] = {title: i, value: 10};
                }else if(data[i] > 80 || data[i] < 90){
                    dataTable[i] = {title: i, value: 8};
                }else if(data[i] > 120 && data[i] <= 130){
                    dataTable[i] = {title: i, value: 3};
                }else if(data[i] > 130 && data[i] <= 140){
                    dataTable[i] = {title: i, value: 5};
                }else if(data[i] > 140 && data[i] <= 150){
                    dataTable[i] = {title: i, value: 6};
                }else if(data[i] > 150 && data[i] <= 160){
                    dataTable[i] = {title: i, value: 7};
                }else if(data[i] > 160 && data[i] <= 170){
                    dataTable[i] = {title: i, value: 8};
                }else if(data[i] > 170 && data[i] < 180){
                    dataTable[i] = {title: i, value: 9};
                }
            }else if(i%5 == 2){
                if(data[i] >= 60 && data[i] <= 80){
                    dataTable[i] = {title: i, value: 1};
                }else if(data[i] <= 50 || data[i] >= 110){
                    dataTable[i] = {title: i, value: 10};
                }else if(data[i] > 50 && data[i] < 60){
                    dataTable[i] = {title: i, value: 8};
                }else if(data[i] > 80 && data[i] <= 90){
                    dataTable[i] = {title: i, value: 4};
                }else if(data[i] > 90 && data[i] <= 100){
                    dataTable[i] = {title: i, value: 6};
                }else if(data[i] > 100 && data[i] < 110){
                    dataTable[i] = {title: i, value: 8};
                }
            }else if(i%5 == 3){
                if (data[i] >= 18.5 && data[i] <= 25){
                    dataTable[i] = {title: i, value: 1};
                }else if (data[i] <= 16 || data[i] > 40){
                    dataTable[i] = {title: i, value: 10};
                }else if(data[i]>16 && data[i]<=17){
                    dataTable[i] = {title: i, value: 7};
                }else if(data[i]>17 && data[i]<18.5){
                    dataTable[i] = {title: i, value: 4};
                }else if(data[i]>25 && data[i]<=30){
                    dataTable[i] = {title: i, value: 4};
                }else if(data[i]>30 && data[i]<=35){
                    dataTable[i] = {title: i, value: 6};
                }else if(data[i]>35 && data[i]<=40) {
                    dataTable[i] = {title: i, value: 8};
                }
            }else if(i%5 == 4){
                if (data[i] >= 96) {
                    dataTable[i] = {title: i, value: 1};
                }else if(data[i] > 94 && data[i] < 96){
                    dataTable[i] = {title: i, value: 4};
                }else if(data[i] > 92 && data[i] <= 94){
                    dataTable[i] = {title: i, value: 7};
                }else if(data[i] > 90 && data[i] < 92){
                    dataTable[i] = {title: i, value: 9};
                }else if(data[i] <= 90){
                    dataTable[i] = {title: i, value: 10};
                }
            }
        }else{
            dataTable[i] = {title: i, value: undefined};
        }
    }

    var chart = circularHeatChart()
        .innerRadius(20)
        .segmentHeight(20)
        .range(["yellow", "red"])
        .numSegments(5)
        .segmentLabels(["Telesna temperatura", "Sistolični krvni tlak", "Diastolični krvni tlak", "Indeks telesne mase", "Nasičenost krvi s kisikom"])
        .accessor(function (d) {
            return d.value;
        });

    $('#chart4').html("");
    d3.select('#chart4')
        .selectAll('svg')
        .data([dataTable])
        .enter()
        .append('svg')
        .call(chart);

    
    d3.selectAll("#chart4 path").on('mouseover', function () {
        var d = d3.select(this).data()[0];
        d3.select("#info").text(d.title + ' has value ' + data[parseInt(d.title)]);
    });
    d3.selectAll("#chart4 svg").on('mouseout', function () {
        d3.select("#info").text('');
    });

}