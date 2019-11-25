window.onload = function(){

    d3.csv('./lol-dataset/kills.csv')
        .then(
            data => {

                data = filterDirtyValues(data);

                data = smartFilter(data);

                var original_data = [].concat(data);

                var length = Math.ceil(data.length /10);    

                //data = data.splice(0,length);

                // console.log(data[0]);

                // console.log(d3.extent(data.map(d => d.x_pos)));
                // console.log(d3.extent(data.map(d => d.y_pos)));

               buildChart(data);


                // var redCheckbox = document.getElementById("redKills");
                // var blueCheckbox = document.getElementById("blueKills");

                // redCheckbox.addEventListener('change', function(){

                //     filterCheckbox(original_data);

                // });

                // blueCheckbox.addEventListener('change', function(){

                //     filterCheckbox(original_data);

                // });

            }
        ).catch(
            error => console.log(error)
        )

};

function update(data){

    console.log('Will update');

    d3.select("svg").remove(); 

    buildChart(data);

}

function buildChart(data){

    var margin = {

        left:125,
        top:40,
        right:110,
        bottom:65

    };

    var width = 1211 - margin.left - margin.right;
    var height = 1080 - margin.top - margin.bottom;

    var xScale = d3.scaleLinear()
    .domain(d3.extent(data.map(d => d.x_pos)))
    .range([0,width]);

    var yScale = d3.scaleLinear()
    .domain(d3.extent(data.map(d => d.y_pos)))
    .range([height,0]);

    var svg = d3.select("#plot")
                .append("svg")
                .attr("width",width + margin.left + margin.right)
                .attr("height",height + margin.top + margin.bottom)
                .append("g")
                .attr("transform","translate(" + margin.left + "," + margin.top + ")");

    var dot = svg.append("g")
    .selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.x_pos))
    .attr("cy", d => yScale(d.y_pos))
    .attr("r", 10)
    .style("stroke", d => {

        if(d.Team == 'bKills'){

            return "rgba(52,152,219,1.0)";

        }

        return "rgba(231,76,60,1.0)";

    })
    .style("fill", d => {

        if(d.Team == 'bKills'){

            return "rgba(52,152,219,0.3)";

        }

        return "rgba(231,76,60,0.3)";

    });

}

function filterCheckbox(original_data){

    let result = [].concat(original_data);

    let redCheckbox = document.getElementById("redKills");
    let blueCheckbox = document.getElementById("blueKills");

    if(redCheckbox.checked){

        original_data = original_data.filter(d => d.Team == 'rKills');

    }

    if(blueCheckbox.checked){

        original_data = original_data.filter(d => d.Team == 'bKills');

    }

    update(result);

}

function filterDirtyValues(data){

    let result;

    result = data.filter(d => !!d.x_pos && !isNaN(d.x_pos));
    result = result.filter(d => !!d.y_pos && !isNaN(d.y_pos));

    result = result.map(d => {

        d.x_pos = parseInt(d.x_pos);
        d.y_pos = parseInt(d.y_pos);

        return d;

    });

    return result;

}

function smartFilter(data){

    let shuffleData = shuffleArray(data);


    calculateRedKills = kills => {

        let rKills = 0;

        kills.forEach(d => {

            if(d.Team == 'rKills'){

                rKills++;

            }

        });

        return rKills;

    };

    calculateBlueKills = kills => {

        let bKills = 0;

        kills.forEach(d => {

            if(d.Team == 'bKills'){

                bKills++;

            }

        });

        return bKills;

    };

    let rKills = calculateRedKills(data);
    let bKills = calculateBlueKills(data);

    let newRKills = Math.ceil(rKills/100);
    let newBKills = Math.ceil(bKills/100);

    let currentRKills = 0;
    let currentBkills = 0;

    let filteredData = [];

    // let blueKillsData = shuffleData.filter(d => d.Team == 'bKills');
    // let redKillsData = shuffleData.filter(d => d.Team == 'rKills');

    shuffleData.forEach(
        d => {

            if(d.Team == 'rKills'){

                if(currentRKills < newRKills){

                    filteredData.push(d);
                    currentRKills++;

                }

            }

            if(d.Team == 'bKills'){

                if(currentBkills < newBKills){

                    filteredData.push(d);
                    currentBkills++;

                }

            }

        }
    );

    // console.log(blueKillsData);
    // console.log(redKillsData);

    // console.log(currentRKills);
    // console.log(newRKills);
    // console.log(newBKills);
    // console.log(shuffleData);
    return filteredData;

}

function shuffleArray(data) {

    let array = [].concat(data); 

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}