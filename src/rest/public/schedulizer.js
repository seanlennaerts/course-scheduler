/**
 * Created by Sean on 11/28/16.
 */
$(function () {
    var active = false;
    $(document).ready(function() {
        try {
            $.ajax("/retrieve", {type:"POST", dataType: "json", success: function(data) {
                generateTable(data["result"]["course"], "#coursesInputTable", "table");
                $("#coursesInputTable").find("table").css("margin-bottom", "0px");
                generateTable(data["result"]["room"], "#roomsInputTable", "table");
                $("#roomsInputTable").find("table").css("margin-bottom", "0px");
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    });

    $("#makeSchedule").click(function () {
        if (!active){
            try {
                $.ajax("/schedulize", {type:"POST", dataType: "json", success: function(data) {
                    var numberOfRooms = data["result"]["scheduled"].length;
                    for (var i=0; i < numberOfRooms; i++) {
                        var roomName = data["result"]["scheduled"][i]["roomName"].split("_")[0] + " " + data["result"]["scheduled"][i]["roomName"].split("_")[1];
                        var roomSize = "Seats: " + data["result"]["scheduled"][i]["seats"];
                        var quality = Number((data["result"]["scheduled"][i]["quality"][2] * 100).toFixed(2));
                        var roomQuality = (quality !=0 ? ", Quality: " + quality + "%"  : "");
                        $("#calendar")
                            .append('<div><h4>' + roomName + '</h4>' + roomSize + roomQuality + '<div class="calendarList" id="mycal' + i + '"></div>');
                        $("#mycal" + i).easycal({
                            columnDateFormat : 'dddd',
                            minTime : '08:00:00',
                            maxTime : (data["result"]["scheduled"][i]["schedule"].length < 16 ? '17:00:00' : '21:30:00'),
                            slotDuration : 30,
                            startDate : '31-10-2015',
                            events : (data["result"]["scheduled"][i]["schedule"][0] === "" ? [] : getEvents(data["result"]["scheduled"][i]["schedule"]))
                        });
                    }
                    if (data["result"]["unscheduled"].length > 0) {
                        generateTable(data["result"]["unscheduled"],"#notScheduled","table");
                        $("#notScheduled").find("table").css("margin-bottom", "0px");
                        $("#scrollableTable").show();
                    }
                    $("#scheduleResult").append("<p>" + JSON.stringify(data) + "</p>");
                    active = true;
                }}).fail(function (e) {
                    spawnHttpErrorModal(e)
                });
            } catch (err) {
                spawnErrorModal("Query Error", err);
            }
        }
    });

    function getEvents(scheduled){
        var adder = 0;
        var adderOdd = 0;
        var temp = [];
        for (var j=0; j < scheduled.length; j++) {
            if (j <= 8 || (j >= 15 && j <= 18)) {
                //monday wednesday friday
                for (var mwf = 26; mwf < 31; mwf+=2) {
                    var mwfblock = {
                        id: j,
                        title: scheduled[j].split("_")[0].toUpperCase() + " " + scheduled[j].split("_")[1],
                        start: mwf + "-10-2015 " + (j <= 8 ? 8 + j : 2 + j) + ":00:00",
                        end: mwf + "-10-2015 " + (j <= 8 ? 9 + j : 3 + j) + ":00:00",
                        backgroundColor: "#DFF0D8",
                        textColor: "#000"
                    };
                    temp.push(mwfblock);
                }
            } else {
                //tuesday thursday
                for (var tth = 27; tth < 30; tth+=2) {
                    var tthblock = {
                        id: j,
                        title: scheduled[j].split("_")[0].toUpperCase() + " " + scheduled[j].split("_")[1],
                        start: tth + "-10-2015 " + (j <= 14 ? j - 1 + adder : j - 5 + adder) + (j % 2 === 0 ? ":30:00" : ":00:00"),
                        end: tth + "-10-2015 " + (j <= 14 ? j + adderOdd : j - 4 + adderOdd) + (j % 2 === 0 ? ":00:00" : ":30:00"),
                        backgroundColor: "#DFF0D8",
                        textColor: "#000"
                    };
                    temp.push(tthblock);
                }
                if (j % 2 === 0) {
                    adder += 1;
                } else {
                    adderOdd += 1
                }
            }
        }
        return temp;
    }

    function generateTable(data, id, tableClass) {
        var columns = [];
        Object.keys(data[0]).forEach(function (title) {
            columns.push({
                head: title, //.split("_")[1]
                cl: title,
                html: function (d) {
                    return d[title]
                }
            });
        });
        var container = d3.select(id);
        container.html("");
        container.selectAll("*").remove();
        var table = container.append("table").attr("class", tableClass);

        table.append("thead").append("tr")
            .selectAll("th")
            .data(columns).enter()
            .append("th")
            .attr("class", function (d) {
                try{
                    if (orderExists(d["head"])) {
                        return "selectedOrder";
                    }
                } catch(err){
                    //
                }
            })
            .attr("style", "padding-right: 20px")
            .text(function (d) {
                return d["head"]
            });

        table.append("tbody")
            .selectAll("tr")
            .data(data).enter()
            .append("tr")
            .selectAll("td")
            .data(function (row, i) {
                return columns.map(function (c) {
                    // compute cell values for this specific row
                    var cell = {};
                    d3.keys(c).forEach(function (k) {
                        cell[k] = typeof c[k] == "function" ? c[k](row, i) : c[k];
                    });
                    return cell;
                });
            }).enter()
            .append("td")
            .html(function (d) {
                return d["html"]
            })
            .attr("class", function (d) {
                return d["cl"]
            });
    }

    function spawnHttpErrorModal(e) {
        $("#errorModal .modal-title").html(e.status);
        $("#errorModal .modal-body p").html(e.statusText + "</br>" + e.responseText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }

    function spawnErrorModal(errorTitle, errorText) {
        $("#errorModal .modal-title").html(errorTitle);
        $("#errorModal .modal-body p").html(errorText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }
});